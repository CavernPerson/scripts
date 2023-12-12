import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());

  const lsdName = "spectrum_roar_luna_lp";
  let token = handler.getContract(env.fixed_params.lsd_info[lsdName].tokenAddress);
  let lsdWrapperToken = handler.getContract(env.contracts[lsdName]["token"]);

  console.log(token.address, lsdWrapperToken.address)

  let balance = await token.query.balance({
    address:  lsdWrapperToken.address
  })
  console.log("Contract balance", balance)

  let owner_balance = await token.query.balance({
    address:  handler.getAddress()
  })
  console.log("Owner balance", owner_balance)
  return


  // Get underlying luna amount for that balance

  let hub = handler.getContract(env.fixed_params.lsd_info[lsdName].hubAddress);
  let state = await hub.query.state()

  console.log("Wrapper token balance", balance)


  console.log("Underlying luna value", parseInt(balance.balance) * parseFloat(state.exchange_rate))
}

if (require.main === module) {
    main();
}