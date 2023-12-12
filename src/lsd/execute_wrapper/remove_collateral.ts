import { Address } from '../../utils/blockchain/terra_utils';
import { env } from '../../utils/blockchain/env_helper';

export async function whitelistCollateral(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());
  
  let overseer = handler.getContract(env.contracts.mmOverseer);
  // Register the collateral by the overseer
  
  await overseer.execute.remove_whitelist({    
    collateral_token: env.contracts[lsdName]["token"]
  });
  
  
  //Register the collateral by the liquidation queue
  const liquidationQueue = handler.getContract(env.contracts.mmLiquidationQueue);
  console.log(liquidationQueue.address)
  await liquidationQueue.execute.remove_collateral({
    collateral_token: env.contracts[lsdName]["token"]
  })
}

if (require.main === module) {
    whitelistCollateral("ampLuna");
}