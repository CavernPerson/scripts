import * as fs from 'fs';
import { env, globalEnv} from './env_helper';
import { DirectSecp256k1HdWallet, OfflineDirectSigner } from '@cosmjs/proto-signing';
import { Coin, DeliverTxResponse, GasPrice, SigningStargateClient } from '@cosmjs/stargate';
import { CosmWasmClient, ExecuteResult, MsgExecuteContractEncodeObject, MsgMigrateContractEncodeObject, MsgUpdateAdminEncodeObject, SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { MsgExecuteContract, MsgMigrateContract, MsgUpdateAdmin } from 'cosmjs-types/cosmwasm/wasm/v1/tx';
import { toUtf8 } from "@cosmjs/encoding";
import { EncodeObject } from "@cosmjs/proto-signing";


async function sleep(ms: number){
  return new Promise((resolve)=> setTimeout(() => resolve(undefined), ms))
}


// Wrapper for Query and Transaction objects (used to build a common Proxy on top of them)
class LCDClientWrapper {
  wallet: Promise<SigningStargateClient>;
  signerAddr: Promise<string>;
  cosmwasmClient: Promise<SigningCosmWasmClient>;
  contractAddress: string;

  constructor(
    cosmwasmClient: Promise<SigningCosmWasmClient>, 
    wallet: Promise<SigningStargateClient>, 
    signerAddr: Promise<string>,
    contractAddress: string
  ) {
    this.cosmwasmClient = cosmwasmClient;
    this.wallet = wallet;
    this.signerAddr = signerAddr;
    this.contractAddress = contractAddress;
  }
  execute(msgName: string, msgArgs: Object, otherArgs: any) {
    console.log('execute not implemented');
  }
}

/// Execute Msg Handler
/// Removes a lot of code overhead
class Transaction extends LCDClientWrapper {

  async execute(msgName: string, msgArgs: Object, otherArgs: Coin[] | undefined) {
    let msg = {
      [msgName]: {
        ...msgArgs
      }
    };

    let client = await this.cosmwasmClient;
    return client.execute(await this.signerAddr, this.contractAddress, msg, "auto",undefined, otherArgs);
  }
}

/// Proxy Execute Msg Handler
/// Allows to only get the executeMsg from the function, without posting the tx
class ExecuteProxy extends LCDClientWrapper {

  async execute(msgName: string, msgArgs: Object, otherArgs: Coin[] | undefined): Promise<MsgExecuteContractEncodeObject> {
    let msg = {
      [msgName]: {
        ...msgArgs
      }
    };

    const any_msg: MsgExecuteContractEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: MsgExecuteContract.fromPartial({
        sender: await this.signerAddr,
        contract: this.contractAddress,
        msg: toUtf8(JSON.stringify(msg)),
        funds: otherArgs,
      }),
    };  
    return any_msg
  }

  async migrateAdmin(new_admin: string){

    const migrate_msg: MsgUpdateAdminEncodeObject = {
      typeUrl: "/cosmwasm.wasm.v1.MsgUpdateAdmin",
      value: MsgUpdateAdmin.fromPartial({
        sender: await this.signerAddr,
        contract: this.contractAddress,
        newAdmin: new_admin
      })
    }
    return migrate_msg
  }
}

/// Query Msg Handler
/// Removes a lot of code overhead
class Query extends LCDClientWrapper {
  async execute(msgName: string, msgArgs: Object) {
    let msg = { [msgName]: { ...msgArgs } };
    let client = (await this.cosmwasmClient);
    let response = await client.queryContractSmart(this.contractAddress, msg);

    return response;
  }
}

// Internal
// Used to trick the TypeScript compiler into thinking all proxy methods exist
interface Interface<T> {
  [key: string]: (...args: any[]) => Promise<T> ;
}

/// Allows one to query and execute contracts without too much overhead
export class Contract {
  execute: Interface<ExecuteResult>;
  executeProxy: Interface<EncodeObject>;
  query: Interface<any>;
  address: string;

  constructor(handler: Address, contractAddress: string) {
    this.execute = createWrapperProxy(
      new Transaction(handler.cosmwasmClient, handler.wallet, handler.signerAddr, contractAddress)
    ) as unknown as Interface<ExecuteResult>;
    this.query = createWrapperProxy(
      new Query(handler.cosmwasmClient, handler.wallet, handler.signerAddr, contractAddress)
    ) as unknown as Interface<any>;
    this.executeProxy = createWrapperProxy(
      new ExecuteProxy(handler.cosmwasmClient, handler.wallet, handler.signerAddr, contractAddress)
    ) as unknown as Interface<EncodeObject>;
    this.address = contractAddress;
  }

  async migrate(codeId: number, msg: any){
    let contract: Transaction = this.execute as unknown as Transaction;
    let client = await contract.cosmwasmClient;
    let response = client.migrate(await contract.signerAddr, contract.contractAddress, codeId, msg, "auto",undefined)
  }
}

/// Wrapper around a (LCDClient, Wallet) pair.
/// Stores every needed info in the same place and allows for easy contract creation/interaction
export class Address {
  wallet: Promise<SigningStargateClient>;
  signerAddr: Promise<string>;
  cosmwasmClient: Promise<SigningCosmWasmClient>;

  constructor(mnemonic: string = '', customEnv: string | undefined = undefined) {
    let chosen_env: any;
    if(customEnv){
      chosen_env = globalEnv[customEnv]
    }else{
      chosen_env = env;
    }

    const signer = DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
        prefix: chosen_env["prefix"],
    });

    this.signerAddr = signer
      .then((s) => s.getAccounts())
      .then((a) => a[0].address)

    this.cosmwasmClient = signer.then((signer) => SigningCosmWasmClient.connectWithSigner(chosen_env['rpc'],signer, {
      gasPrice: GasPrice.fromString(chosen_env["gas_price"]),

    }));

    this.wallet = signer
    .then((signer: OfflineDirectSigner) => 
      SigningStargateClient.connectWithSigner(chosen_env["rpc"], signer, {
      gasPrice: GasPrice.fromString(chosen_env["gas_price"]),

    })
    );
  }

  async post(msgs: EncodeObject[]) : Promise<DeliverTxResponse> {
    
    let wallet = await this.cosmwasmClient;
    let senderAddr = await this.getAddress();

    await wallet.simulate(senderAddr, msgs, undefined);
    const txResponse = await wallet.signAndBroadcast(senderAddr,msgs,"auto")

    // We wait 1s before giving out the result
    await sleep(1000);
    return txResponse;
  }
  
  async getAddress(): Promise<string> {
    return this.signerAddr
  }
  getContract(contractAddress: string): Contract {
    return new Contract(this, contractAddress);
  }

  async send(address: string, coins: Coin[]): Promise<DeliverTxResponse>{
    let wallet = await this.wallet;

    return wallet.sendTokens(await this.getAddress(), address, coins, "auto");
  }
  async uploadContract(binaryFile: string) {

    let client = (await this.cosmwasmClient);
    let storeCodeTxResult = await client.upload(await this.getAddress(), fs.readFileSync(binaryFile), "auto");

    return storeCodeTxResult.codeId
  }

  async instantiateContract(codeId: number, initMsg: Object, funds: Coin[] = [], label: string | undefined = undefined) {
    
    let client = (await this.cosmwasmClient);
    const instantiateTxResult = await client.instantiate(await this.getAddress(), codeId, initMsg, label ?? "ww Contract","auto",{
      admin: await this.getAddress(),
      funds
    });

    return this.getContract(instantiateTxResult.contractAddress);
  }

  async executeMultiple(inMsgs: any[]): Promise<ExecuteResult>{

    let client = (await this.cosmwasmClient);
    return client.executeMultiple(await this.getAddress(),inMsgs.map((msg) => ({
      contractAddress: msg.contractAddress,
      msg: msg.msg,
      funds: msg.funds
    })), "auto")
  }

  async estimateFeeEncoded(msgs: EncodeObject[]): Promise<number>{
    let client = await this.cosmwasmClient;
    return client.simulate(await this.signerAddr, msgs, undefined);
  }
  
  async estimateFee(msgs: any[]): Promise<number> {
    return estimateFee(await this.cosmwasmClient, await this.getAddress(), msgs);
  }
}

async function estimateFee(client: SigningCosmWasmClient, signerAddr: string, msgs: any[]): Promise<number>{

    return client.simulate(signerAddr, msgs.map((msg) => 
      ({
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: MsgExecuteContract.fromPartial({
          sender: signerAddr,
          contract: msg.contractAddress,
          msg: Buffer.from(JSON.stringify(msg.msg)),
          funds: msg.funds
        }),
      })), undefined)
}

/*
export async function estimateFee(address: string, msgs: any[], customEnv?: string) {
    let chosenEnv;
    if(customEnv){
      chosenEnv = globalEnv[customEnv]
    }else{
      chosenEnv = env
    }
    const terra = new LCDClient(chosenEnv['chain']);

    const { data: gasPrices } = await Axios.get(
      'https://phoenix-fcd.terra.dev/v1/txs/gas_prices'
    ).catch((err) => ({
      data: "0.015uluna"
    }));
    const txOptions: CreateTxOptions = {
      msgs,
      memo: "",
      gasPrices,
      gasAdjustment: 1.75,
    };
    const accountInfo = await terra.auth.accountInfo(
      address
    );
  // Test raw estimate fee function with specified gas
  const rawFee = await terra.tx.estimateFee(
    [
      {
        publicKey: new SimplePublicKey(address),
        sequenceNumber: accountInfo.getSequenceNumber(),
      },
    ],
    txOptions
  );
  return rawFee
}*/

/// Allows the messages to be called via methods instead of wrapped objects
function createWrapperProxy<T extends LCDClientWrapper>(wrapper: T): T {
  let handler = {
    get: function (target: T, prop: string, receiver: any) {
      if (!(prop in target))
        return function (args: Object, otherArgs: any) {
          return target.execute(prop.toString(), args, otherArgs);
        };
      else return Reflect.get(target, prop);
    }
  };
  return new Proxy(wrapper, handler);
}
