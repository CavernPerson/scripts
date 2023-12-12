import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  const lsdName = "spectrum_usdc_luna_lp";
  let lsdWrapperToken = handler.getContract(env.contracts[lsdName]["token"]);

  let tokenInfo = await lsdWrapperToken.query.token_info()
  console.log(tokenInfo)

  // We query the reward contract supply

  let rewardBalances = await handler.terra.bank.spendableBalances(env.contracts[lsdName]["reward"]);
  console.log(rewardBalances[0]);
}

if (require.main === module) {
    main();
}