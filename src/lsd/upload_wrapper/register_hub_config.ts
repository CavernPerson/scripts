import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export async function register_hub_config(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());

  let hub = handler.getContract(env.contracts[lsdName]["hub"]);

  await hub.execute.update_config({
        reward_contract: env.contracts[lsdName]["reward"],
        token_contract: env.contracts[lsdName]["token"]
  });
}

if (require.main === module) {
    register_hub_config("steak")
}