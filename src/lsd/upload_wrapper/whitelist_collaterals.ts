import { Address } from '../../utils/blockchain/terra_utils';
import { env } from '../../utils/blockchain/env_helper';

export async function whitelistCollateral(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());
  
  let overseer = handler.getContract(env.contracts.mmOverseer);
  // Register the collateral by the overseer
  
  await overseer.execute.whitelist({
    name: env.fixed_params.lsd_info[lsdName].name,
    symbol: env.fixed_params.lsd_info[lsdName].symbol,         
    collateral_token: env.contracts[lsdName].token,
    custody_contract: env.contracts[lsdName].custody,
    max_ltv: env.fixed_params.lsd_info[lsdName].max_ltv,
  });
  
  
  //Register the collateral by the liquidation queue
  const liquidationQueue = handler.getContract(env.contracts.mmLiquidationQueue);
  console.log(liquidationQueue.address)
  await liquidationQueue.execute.whitelist_collateral({
    collateral_token: env.contracts[lsdName].token,
    bid_threshold: env.fixed_params.liquidation.bid_threshold,
    max_slot: env.fixed_params.liquidation.max_slot,
    premium_rate_per_slot: env.fixed_params.liquidation.premium_rate_per_slot
  })
}

if (require.main === module) {
    whitelistCollateral("ampLuna");
}