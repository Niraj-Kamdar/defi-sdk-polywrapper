import { XSUSHI_ADDRESS } from "../constants";
import { getPairAddress } from "../utils/addressUtils";
import { getChainId } from "../utils/network";
import {
  env,
  Ethereum_Connection,
  Ethereum_Query,
  Input_isValidProtocolToken,
  QueryEnv,
} from "../w3";

function isValidSushiswapPool(tokenAddress: string, connection: Ethereum_Connection): boolean {
  const token0AddressResult = Ethereum_Query.callContractView({
    address: tokenAddress,
    method: "function token0() external view returns (address)",
    args: [],
    connection: connection,
  });
  // if exception encountered, pair contract presumed not to exist
  if (token0AddressResult.isErr) {
    return false;
  }
  const token0Address = token0AddressResult.unwrap();
  const token1AddressResult = Ethereum_Query.callContractView({
    address: tokenAddress,
    method: "function token1() external view returns (address)",
    args: [],
    connection: connection,
  });
  if (token1AddressResult.isErr) {
    return false;
  }
  const token1Address = token1AddressResult.unwrap();
  const chainId: i32 = getChainId(connection);
  const pairAddress = getPairAddress(token0Address, token1Address, chainId);
  return tokenAddress.toLowerCase() == pairAddress.toLowerCase();
}

function isValidSushibarToken(tokenAddress: string): boolean {
  return tokenAddress.toLowerCase() == XSUSHI_ADDRESS.toLowerCase();
}

export function isValidProtocolToken(input: Input_isValidProtocolToken): boolean {
  if (env == null) throw new Error("env is not set");
  const connection = (env as QueryEnv).connection;

  if (input.protocolId == "sushiswap_v1") {
    return isValidSushiswapPool(input.tokenAddress, connection);
  } else if (input.protocolId == "sushibar_v1") {
    return isValidSushibarToken(input.tokenAddress);
  } else {
    throw new Error(`Unknown protocolId: ${input.protocolId}`);
  }
}
