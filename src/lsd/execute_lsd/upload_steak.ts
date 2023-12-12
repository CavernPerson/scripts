import { Address } from '../../utils/blockchain/terra_utils';
import { env, add_contract } from '../../utils/blockchain/env_helper';

export async function main() {
  // Getting a handler for the current address
  let handler = new Address(env['mnemonics']["deployer"]);
  console.log(handler.getAddress());


  // Uploading the contract code for hub and token
  let hubCodeId: string[] = await handler.uploadContract(
    `../LSD/steak/artifacts/steak_hub.wasm`
  );
  let tokenCodeId: string[] = await handler.uploadContract(
    `../LSD/steak/artifacts/steak_token.wasm`
  );

  // Initialize contract
  let hubInitMsg = {
  /// Code ID of the CW20 token contract
    cw20_code_id: +tokenCodeId[0],
    /// Account who can call certain privileged functions
    owner: handler.getAddress(),
    /// Name of the liquid staking token
    name: "steak",
    /// Symbol of the liquid staking token
    symbol: "STK",
    /// Number of decimals of the liquid staking token
    decimals: 6,
    /// How often the unbonding queue is to be executed, in seconds
    epoch_period: 30,
    /// The staking module's unbonding time, in seconds
    unbond_period: 30,
    /// Initial set of validator[s who will receive the delegations
    validators: env.vars.validators
  };

  let contract = await handler.instantiateContract(+hubCodeId[0], hubInitMsg, `1000000${env.vars.stable_denom}`);
  add_contract("Steak Hub", contract.address);
}


if (require.main === module) {
    main();
}
