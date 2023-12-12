
import { Address } from './utils/blockchain/terra_utils';
import { env, add_contract } from './utils/blockchain/env_helper';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());


  let tx_id = "815D70748E8493E3EFD6D93DC1E8DC04AA927341C237DFB2D6B4D07576992116";
  let tx_details = await (await handler.wallet).getTx(tx_id);

  console.log(JSON.stringify(tx_details?.events, undefined, 4));

}

main()
