import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  let hub = handler.getContract(env.contracts["Steak Hub"]);

  let harvest_result = await hub.execute.harvest();

}

if (require.main === module) {
    main();
}