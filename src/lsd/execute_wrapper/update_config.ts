import { Address } from '../../utils/blockchain/terra_utils';
import { env } from '../../utils/blockchain/env_helper';

export async function register_hub_config(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  let reward = handler.getContract(env.contracts[lsdName]["reward"]);

  await reward.execute.update_config({
    terraswap_addr: env.external_contracts.whitewhale_addr,
  });
}

if (require.main === module) {
    register_hub_config("ampWhale")
}