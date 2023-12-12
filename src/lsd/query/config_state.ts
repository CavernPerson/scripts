import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());
  const lsdName = "bWhale"
  console.log(lsdName)
  let hub = handler.getContract(env.fixed_params.lsd_info[lsdName].hubAddress);

  let config = await hub.query.config()
  let state = await hub.query.state()

  console.log(config, state)
}

if (require.main === module) {
    main();
}