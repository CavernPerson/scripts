import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';
import _ from "lodash";

export async function register_rewards_config(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());

  let rewards = handler.getContract(env.contracts[lsdName].reward);

  await rewards.execute.update_config({
    custody_contract: env.contracts[lsdName].custody,
    known_tokens: _.compact([
      env.fixed_params.lsd_info[lsdName].tokenAddress,
    ].concat(env.fixed_params.lsd_info[lsdName]["known_tokens"] ?? []))
  });
}

if (require.main === module) {
    register_rewards_config("ampLuna")
}