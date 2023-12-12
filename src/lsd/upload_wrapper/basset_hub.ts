  import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract, add_lsd_contract } from '../../utils/blockchain/env_helper';

/// Here we want to upload the p2p contract and add the fee contract
export async function deploy_lsd_wrapper_hub(lsdName: string) {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log("Deployer address: ", await handler.getAddress());

  let contractName = "anchor_aasset_hub";
  // Initialize contract
  let initMsg = {
    reward_denom: env.fixed_params.lsd_info[lsdName].reward_denom
  };
  
  // Uploading the contract code
  let codeId: number = await handler.uploadContract(
    `../LSD/cavern-lsd-wrapper/artifacts/${contractName}.wasm`
  );
  
  let contract = await handler.instantiateContract(codeId, initMsg);
  add_lsd_contract(lsdName, "hub", contract.address);

}