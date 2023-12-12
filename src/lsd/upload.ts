import { deploy_lsd_wrapper_hub } from "./upload_wrapper/basset_hub"
import { deploy_basset_reward} from "./upload_wrapper/basset_reward"
import { deploy_lsd_wrapper_contract } from "./upload_wrapper/basset_token"
import { deploy_custody_contract } from "./upload_wrapper/custody_wlsd"
import { register_hub_config } from "./upload_wrapper/register_hub_config"
import { register_rewards_config } from "./upload_wrapper/register_reward_config"
import { env, env_name } from "../utils/blockchain/env_helper"
import { Address } from "../utils/blockchain/terra_utils"
import { register_oracle_feeder } from "./upload_wrapper/register_oracle_feeder"
import { whitelistCollateral } from "./upload_wrapper/whitelist_collaterals"


function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
async function wait_for_distant_envs(){
  if (env_name == "staging" || env_name == "mainnet") {
    await sleep(1000);
  }
}

async function balance(handler: Address, coin: string){
  let wallet = await handler.wallet;
  let address = await handler.getAddress();
  let balance = await wallet.getBalance(address, coin)
  return parseInt(balance.amount)
}


export default async function main() {
  
  let handler = new Address(env['mnemonics']["deployer"]);

  const lsdName = "bLUNA";

  const balance_before = await balance(handler, "uwhale");

  // First the asset hub
  await deploy_lsd_wrapper_hub(lsdName);
  console.log("Hub init done")
  await wait_for_distant_envs();

  // Then the rewards basset
  await deploy_basset_reward(lsdName);
  console.log("reward init done")
  await wait_for_distant_envs();

  // Then the tokens basset
  await deploy_lsd_wrapper_contract(lsdName);
  console.log("token init done")
  await wait_for_distant_envs();

  await register_hub_config(lsdName);
  console.log("hub config registered");
  await wait_for_distant_envs();

  // Then the custody bluna contract
  await deploy_custody_contract(lsdName);
  console.log("custody lsd init done")
  await wait_for_distant_envs();

  await register_rewards_config(lsdName);
  console.log("rewards config registered");
  await wait_for_distant_envs();

  // Then we integrate it into the whole platform
  // The functions after this line are to be called with the multisig, that is the only one able to do those calls

  // We register the oracle feeders
  await register_oracle_feeder(lsdName);
  console.log("oracle feeders registered")
  await wait_for_distant_envs();

  // Finally, we whitelist collaterals in the overseer and liquidation contracts
  await whitelistCollateral(lsdName);
  console.log("whitelisted collateral")
  await wait_for_distant_envs();
  
  const balance_after = await balance(handler, "uwhale");

  console.log("Luna spent : ", balance_before - balance_after)
}



main()
  .then((resp) => {
    console.log(resp);
  })
  .catch((err) => {
    console.log(err);
  });
