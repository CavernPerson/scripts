import { Address } from '../utils/blockchain/terra_utils';
import { env } from '../utils/blockchain/env_helper';
import { MsgMigrateContract } from '@terra-money/terra.js';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());
  // Uploading the contract code
  

  const lsdName = "spectrum_usdc_luna_lp"
  let contractName = env.fixed_params.lsd_info[lsdName].tokenCodeName;
  let codeId: string[] = await handler.uploadContract(
    `../LSD/cavern-lsd-wrapper/artifacts/${contractName}.wasm`
  );
    
  let lsdWrapperToken = handler.getContract(env.contracts[lsdName]["token"]);

  // Migrate the contract
  let contract = handler.getContract(lsdWrapperToken.address);
  let migrate_msg = new MsgMigrateContract(handler.getAddress(), contract.address, +codeId[0], {
      max_decompound_ratio: env.fixed_params.lsd_info[lsdName].max_decompound_ratio,
  })
  await handler.post([migrate_msg]);
  console.log("migrated the contract");
}
  
main()
  .then((resp) => {
    console.log(resp);
  })
  .catch((err) => {
    console.log(err);
  });
