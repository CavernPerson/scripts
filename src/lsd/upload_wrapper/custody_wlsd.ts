import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract, add_lsd_contract } from '../../utils/blockchain/env_helper';
import _ from "lodash";

export async function deploy_custody_contract(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());


  let contractName = "custody_lsd";
  // Initialize contract
  let initMsg = {
    owner: await handler.getAddress(),
    overseer_contract: env.contracts.mmOverseer,
    market_contract: env.contracts.mmMarket,
    liquidation_contract: env.contracts.mmLiquidationQueue,
    stable_token: {
      native_token: {
        denom: env.vars.stable_denom,
      }
    },
    astroport_addr: env.external_contracts.astroport_addr,
    phoenix_addr: env.external_contracts.phoenix_addr,
    terraswap_addr: env.external_contracts.whitewhale_addr,


    collateral_token: env.contracts[lsdName].token,
    reward_contract: env.contracts[lsdName].reward,
    basset_info: {
      name: env.fixed_params.lsd_info[lsdName].name,
      symbol: env.fixed_params.lsd_info[lsdName].symbol,
      decimals: env.fixed_params.lsd_info[lsdName].decimals,
    },

    known_tokens: []
  };
  console.log(initMsg)


  // Uploading the contract code
  let codeId: number = await handler.uploadContract(
    `../money-market-contracts/artifacts/moneymarket_${contractName}.wasm`
  );

  let contract = await handler.instantiateContract(codeId, initMsg);
  add_lsd_contract(lsdName, "custody", contract.address);

}
if (require.main === module) {
    deploy_custody_contract("steak")
}