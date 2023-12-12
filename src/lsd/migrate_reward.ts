import { Address } from '../utils/blockchain/terra_utils';
import { env } from '../utils/blockchain/env_helper';

export default async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());
  // Uploading the contract code
  

	let all_lsds = ["boneWhale", "ampWhale", "ampLUNA", "bLUNA"]

  let migrate_msgs = [];


  let contractName = "anchor_basset_reward";

  let codeId: number = await handler.uploadContract(
    `../LSD/cavern-lsd-wrapper/artifacts/${contractName}.wasm`
  );

  for(const lsd of all_lsds){
    let reward_contract = handler.getContract(env.contracts[lsd].reawrd);
    await reward_contract.migrate(codeId, {})
    console.log(`migrated the contract ${lsd}`);
  }


  
}
  
main()
  .then((resp) => {
    console.log(resp);
  })
  .catch((err) => {
    console.log(err);
  });
