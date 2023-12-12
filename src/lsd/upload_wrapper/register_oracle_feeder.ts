import { Address, Contract } from '../../utils/blockchain/terra_utils';
import { env } from '../../utils/blockchain/env_helper';
import { asyncAction } from '../../utils/js/asyncAction';



export async function register_feeder_optional(oracle: Contract, oracle_feeder: Address, asset: string){
  const [err, data]  = await asyncAction(
    oracle.query.feeder({
      asset: asset,
    })
  );
  if(err){ // If not registered yet
    await oracle.execute.register_feeder({
      asset: asset,
      feeder: await oracle_feeder.getAddress(),
    });
  } 
}

export async function register_oracle_feeder(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());

  let oracle_feeder = new Address(env['mnemonics']["oracle_feeder"]);

  let oracle = handler.getContract(env.contracts.mmOracle);
  console.log("oracle_feeder address", await oracle_feeder.getAddress())
  
  await oracle.execute.register_feeder({
    asset: env.contracts[lsdName].token,
    feeder: await oracle_feeder.getAddress(),
  });
  
  // We register also the feeder for the lsd token as well as the underlying token. This is used for decompounding
  if(env.fixed_params.lsd_info[lsdName].type == "coin_lst"){
    await register_feeder_optional(oracle, oracle_feeder, env.fixed_params.lsd_info[lsdName].denom);
    await register_feeder_optional(oracle, oracle_feeder, env.fixed_params.lsd_info[lsdName].underlying_denom);
  }
  
}

if (require.main === module) {
    register_oracle_feeder("bWhale");
}