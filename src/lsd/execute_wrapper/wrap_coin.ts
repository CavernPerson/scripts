import { Address } from '../../utils/blockchain/terra_utils';
import { env } from '../../utils/blockchain/env_helper';

export async function mint_collateral(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  let lsdWrapperToken = handler.getContract(env.contracts[lsdName]["token"]);

  const amount = "100000";

  await lsdWrapperToken.execute.mint_with({
        lsd_amount: amount,
        recipient: handler.getAddress()
  }, `${amount}${env.fixed_params.lsd_info[lsdName].denom}`);
}

if (require.main === module) {
    mint_collateral("stLuna")
}