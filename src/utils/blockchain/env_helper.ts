let globalEnv = require('../../../env.json');
const fs = require('fs');

let env_name: string;
if (process.argv[2]) {
  env_name = process.argv[2];
} else {
  env_name = 'dev';
}
let env = globalEnv[env_name];

function add_uploaded_token(codeName: string, address: string) {
  if (! globalEnv[env_name]['cw20']) {
     globalEnv[env_name]['cw20'] = {};
  }
   globalEnv[env_name]['cw20'][codeName] = address;

  let data = JSON.stringify(globalEnv, undefined, 4);
  fs.writeFileSync('env.json', data);
}

function add_uploaded_nft(codeName: string, address: string) {
  if (!globalEnv[env_name]['cw721']) {
     globalEnv[env_name]['cw721'] = {};
  }
  globalEnv[env_name]['cw721'][codeName] = address;

  let data = JSON.stringify(globalEnv, undefined, 4);
  fs.writeFileSync('env.json', data);
}

function add_contract(contractName: string, address: string) {
  if (!globalEnv[env_name]['contracts']) {
    globalEnv[env_name]['contracts'] = {};
  }
  globalEnv[env_name]['contracts'][contractName] = address;

  let data = JSON.stringify(globalEnv, undefined, 4);
  fs.writeFileSync('env.json', data);
  console.log(`${contractName} added to env`)
}

function add_lsd_contract(lsdName: string, contractName: string, address: string) {
  if (!globalEnv[env_name]['contracts']) {
    globalEnv[env_name]['contracts'] = {};
  }  
  if (!globalEnv[env_name]['contracts'][lsdName]) {
    globalEnv[env_name]['contracts'][lsdName] = {};
  }
  globalEnv[env_name]['contracts'][lsdName][contractName] = address;

  let data = JSON.stringify(globalEnv, undefined, 4);
  fs.writeFileSync('env.json', data);
  console.log(`${contractName} added to env`)
}

export { env, globalEnv, env_name, add_uploaded_token, add_uploaded_nft, add_contract, add_lsd_contract };
