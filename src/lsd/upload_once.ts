import { deploy_lsd_wrapper_hub } from "./upload_wrapper/basset_hub"
import { deploy_basset_reward} from "./upload_wrapper/basset_reward"
import { deploy_lsd_wrapper_contract } from "./upload_wrapper/basset_token"
import { deploy_custody_contract } from "./upload_wrapper/custody_wlsd"
import { register_hub_config } from "./upload_wrapper/register_hub_config"
import { register_rewards_config } from "./upload_wrapper/register_reward_config"
import { env, env_name } from "../utils/blockchain/env_helper"
import { Address } from "../utils/blockchain/terra_utils"
import { Int } from "@terra-money/terra.js"
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


export default async function main() {
  
  let handler = new Address(env['mnemonics']["deployer"]);

  const lsdName = "spectrum_usdc_luna_lp";

  const balance_before = (
    await handler.terra.bank.balance(handler.getAddress())
    )[0].get("uluna")?.amount ?? new Int(0);

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

  // We register the oracle feeders
  await register_oracle_feeder(lsdName);
  console.log("oracle feeders registered")
  await wait_for_distant_envs();


  // That's only doable by the contract admin (not this address)
    // // Finally, we whitelist collaterals in the overseer and liquidation contracts
    // await whitelistCollateral(lsdName);
    // console.log("whitelisted collateral")
    // await wait_for_distant_envs();

  const balance_after = (
    await handler.terra.bank.balance(handler.getAddress())
    )[0].get("uluna")?.amount ?? new Int(0);

  console.log("Luna spent : ", balance_before.sub(balance_after))
}



main()
  .then((resp) => {
    console.log(resp);
  })
  .catch((err) => {
    console.log(err);
  });
