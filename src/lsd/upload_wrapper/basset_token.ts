import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract, add_lsd_contract } from '../../utils/blockchain/env_helper';

export async function deploy_lsd_wrapper_contract(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());

  
  // Initialize contract
  let lsd_config;
  let additionalInit;
  if(env.fixed_params.lsd_info[lsdName].type == "coin_lst"){ // For coin LSDs
    lsd_config = {
      denom: env.fixed_params.lsd_info[lsdName].denom,
      underlying_token_denom: env.fixed_params.lsd_info[lsdName].underlying_denom,
      oracle_contract: env.contracts.mmOracle
    }
  }else if (env.fixed_params.lsd_info[lsdName].type  == "spectrum_lp"){ // For spectrum tokens
    lsd_config = {
      token: env.fixed_params.lsd_info[lsdName].tokenAddress,
      generator: env.fixed_params.lsd_info[lsdName].generator,
      underlying_token: env.fixed_params.lsd_info[lsdName].underlying_token,
    }
    additionalInit = {
      max_decompound_ratio: env.fixed_params.lsd_info[lsdName].max_decompound_ratio,
    }
  }else if(env.fixed_params.lsd_info[lsdName].type == "amp_lp"){
    lsd_config = {
      token: env.fixed_params.lsd_info[lsdName].tokenAddress,
      hub: env.fixed_params.lsd_info[lsdName].hub,
    }
    additionalInit = {
      max_decompound_ratio: env.fixed_params.lsd_info[lsdName].max_decompound_ratio,
    }
  } else { // For steak tokens
    lsd_config = {
      hub: env.fixed_params.lsd_info[lsdName].hubAddress,
      token:  env.fixed_params.lsd_info[lsdName].tokenAddress,
    }
  }

  let initMsg = {
    name: env.fixed_params.lsd_info[lsdName].name,
    symbol: env.fixed_params.lsd_info[lsdName].symbol,
    decimals: env.fixed_params.lsd_info[lsdName].decimals,
    initial_balances: [],

    hub_contract: env.contracts[lsdName].hub,

    ...additionalInit,
    lsd_config,
  };

  let contractName = env.fixed_params.lsd_info[lsdName].tokenCodeName;
  // Uploading the contract code
  let codeId: number = await handler.uploadContract(
    `../LSD/cavern-lsd-wrapper/artifacts/${contractName}.wasm`
  );

  let contract = await handler.instantiateContract(codeId, initMsg);
  add_lsd_contract(lsdName, "token", contract.address);
}

if (require.main === module) {
    deploy_lsd_wrapper_contract("steak")
}