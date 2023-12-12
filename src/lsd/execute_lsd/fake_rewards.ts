import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';
import { MsgSend } from '@terra-money/terra.js';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  const lsdName = "ampLuna";
  let lsd = handler.getContract(env.fixed_params.lsd_info[lsdName].tokenAddress);
  
  lsd.execute.transfer({
    amount: "10",
    recipient: env.contracts[lsdName].token
  })

  /*
  await handler.post([
    new MsgSend(handler.getAddress(), env.contracts[lsdName].reward, "100uluna" )
  ])
  */


}

if (require.main === module) {
    main();
}