import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_lsd_contract } from '../../utils/blockchain/env_helper';

export async function deploy_basset_reward(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(await handler.getAddress());

  let contractName = "anchor_basset_reward";
  if(env.fixed_params.lsd_info[lsdName].rewardCodeName){
    contractName = env.fixed_params.lsd_info[lsdName].rewardCodeName
    console.log("Specific reward contract", contractName)
  }

  // For spectrum based LSDs, we have to register extra configuration
  let retrieve_config;
  if(env.fixed_params.lsd_info[lsdName].type == "spectrum_lp"){
    retrieve_config = {
      spectrum_token: env.fixed_params.lsd_info[lsdName].tokenAddress,
      pair: env.fixed_params.lsd_info[lsdName].underlying_pair,
    }
  }else if(env.fixed_params.lsd_info[lsdName].type == "amp_lp"){
    retrieve_config = {
      amp_lp_token: env.fixed_params.lsd_info[lsdName].tokenAddress,
      hub: env.fixed_params.lsd_info[lsdName].hub,
      pair: env.fixed_params.lsd_info[lsdName].underlying_pair,
    }
  }

  // Initialize contract
  let initMsg = {
    hub_contract: env.contracts[lsdName].hub,
    reward_denom: env.fixed_params.lsd_info[lsdName].reward_denom,
    astroport_addr: env.external_contracts.astroport_addr,
    phoenix_addr: env.external_contracts.phoenix_addr,
    terraswap_addr: env.external_contracts.whitewhale_addr,

    known_tokens: [],

    retrieve_config,
  };

  // Uploading the contract code
  let codeId: number = await handler.uploadContract(
    `../LSD/cavern-lsd-wrapper/artifacts/${contractName}.wasm`
  );

  let contract = await handler.instantiateContract(codeId, initMsg);
    add_lsd_contract(lsdName, "reward", contract.address);

}
