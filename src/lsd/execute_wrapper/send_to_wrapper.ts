import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export async function register_hub_config(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  let lsdToken = handler.getContract(env.fixed_params.lsd_info[lsdName].tokenAddress);
  let lsdWrapperToken = handler.getContract(env.contracts[lsdName]["token"]);
  let custody = handler.getContract(env.contracts[lsdName]["custody"])

  const amount = "100000"

  // First we mint some lsd Wrapper Token
  await lsdToken.execute.transfer({
        recipient: lsdWrapperToken.address,
        amount,
  });

  /*

  // That is deposited directly into the market.
  await lsdWrapperToken.execute.send({
    contract: custody.address,
    amount,
    msg: Buffer.from(JSON.stringify({
      deposit_collateral:{

      }
    })).toString("base64")
  })

  */

}

if (require.main === module) {
    register_hub_config("amp_roar_luna_lp")
}