import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export async function mint_collateral(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  let lsdToken = handler.getContract(env.fixed_params.lsd_info[lsdName].tokenAddress);
  let lsdWrapperToken = handler.getContract(env.contracts[lsdName]["token"]);
  let custody = handler.getContract(env.contracts[lsdName]["custody"])

  const amount = "100000"

  // First we mint some lsd Wrapper Token
  /* await lsdToken.execute.increase_allowance({
        spender: lsdWrapperToken.address,
        amount,
  });*/
  await lsdWrapperToken.execute.mint({
        amount,
        recipient: handler.getAddress()
  });
}

if (require.main === module) {
    mint_collateral("ampLuna")
}