import { COMPOUND_COMPTROLLER_ADDRESS } from "../constants";
import {
  env,
  Ethereum_Connection,
  Ethereum_Query,
  Input_isValidProtocolToken,
  QueryEnv,
} from "../w3";

function isValidCompoundPool(cTokenAddress: string, connection: Ethereum_Connection): boolean {
  const cTokenListRes = Ethereum_Query.callContractView({
    address: COMPOUND_COMPTROLLER_ADDRESS,
    method: "function getAllMarkets() public view returns (CToken[] memory)",
    args: [],
    connection: connection,
  });
  if (cTokenListRes.isErr) {
    throw new Error("Failed to fetch cToken list");
  }
  const cTokens: string[] = cTokenListRes.unwrap().split(",");
  return cTokens.includes(cTokenAddress);
}

export function isValidProtocolToken(input: Input_isValidProtocolToken): boolean {
  if (env == null) throw new Error("env is not set");
  const connection = (env as QueryEnv).connection;

  if (input.protocolId == "compound_v1") {
    return isValidCompoundPool(input.tokenAddress, connection);
  } else {
    throw new Error(`Unknown protocolId: ${input.protocolId}`);
  }
}
