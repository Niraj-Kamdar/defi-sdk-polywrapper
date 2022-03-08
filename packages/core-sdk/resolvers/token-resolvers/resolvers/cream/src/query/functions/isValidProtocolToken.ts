import { getCreamComptrollerAddress, IRON_BANK_COMPTROLLER_ADDRESS } from "../constants";
import { getChainId } from "../utils/network";
import {
  env,
  Ethereum_Connection,
  Ethereum_Query,
  Input_isValidProtocolToken,
  QueryEnv,
} from "../w3";

function isValidCreamPool(
  token: string,
  comptroller: string,
  connection: Ethereum_Connection,
): boolean {
  const tokenListRes = Ethereum_Query.callContractView({
    address: comptroller,
    method: "function getAllMarkets() public view returns (address[])",
    args: [],
    connection: connection,
  });
  if (tokenListRes.isErr) {
    throw new Error("Failed to fetch market list");
  }
  const tokens: string[] = tokenListRes.unwrap().split(",");
  const argToken: string = token.toLowerCase();
  for (let i = 0; i < tokens.length; i++) {
    if (argToken == tokens[i].toLowerCase()) {
      return true;
    }
  }
  return false;
}

function isValidCreamPoolV1(token: string, connection: Ethereum_Connection): boolean {
  const chainId: i32 = getChainId(connection);
  const comptroller: string = getCreamComptrollerAddress(chainId);
  return isValidCreamPool(token, comptroller, connection);
}

export function isValidProtocolToken(input: Input_isValidProtocolToken): boolean {
  if (env == null) throw new Error("env is not set");
  const connection = (env as QueryEnv).connection;

  if (input.protocolId == "cream_v1") {
    return isValidCreamPoolV1(input.tokenAddress, connection);
  } else if (input.protocolId == "cream_v2") {
    return isValidCreamPool(input.tokenAddress, IRON_BANK_COMPTROLLER_ADDRESS, connection);
  } else {
    throw new Error(`Unknown protocolId: ${input.protocolId}`);
  }
}
