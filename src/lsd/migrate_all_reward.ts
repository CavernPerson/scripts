import { Address } from '../utils/blockchain/terra_utils';
import { env } from '../utils/blockchain/env_helper';
import { MsgMigrateContract } from '@terra-money/terra.js';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());
  // Uploading the contract code
  

  const lsdNames = ["ampWhale"]
  let contractName = "anchor_basset_reward";
  let codeId: string[] = await handler.uploadContract(
    `../LSD/cavern-lsd-wrapper/artifacts/${contractName}.wasm`
  );
  console.log(codeId);
    
    
  // Migrate the contract
  const migrateMsgs = lsdNames.map((name)=> {
      return new MsgMigrateContract(handler.getAddress(), env.contracts[name]["reward"], +codeId[0], {})
  })
  await handler.post(migrateMsgs);
  console.log("migrated the contract");
  
}
  
main()
  .then((resp) => {
    console.log(resp);
  })
  .catch((err) => {
    console.log(err);
  });
