import { Address } from '../../utils/blockchain/terra_utils';
import { env } from '../../utils/blockchain/env_helper';

export async function register_hub_config(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());

  let hub = handler.getContract(env.contracts[lsdName]["hub"]);
  let token = handler.getContract(env.contracts[lsdName]["token"]);
  let response = await token.query.token_info();
  console.log(response)

  await hub.execute.update_global_index();


  response = await token.query.token_info();
  console.log(response)
}

if (require.main === module) {
    register_hub_config("boneWhale")
}