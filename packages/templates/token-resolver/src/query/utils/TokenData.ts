import {
  Ethereum_Connection,
  Ethereum_Query,
  Interface_Token,
  Token_Query,
  Token_TokenType,
} from "../w3";

export class TokenData {
  decimals: i32;
  balance: string;
}

/* Example of a standard method of obtaining token data
 * The correct method varies by protocol
 */
export function getUnderlyingTokenData(
  underlyingTokenAddress: string,
  poolAddress: string,
  connection: Ethereum_Connection,
): TokenData | null {
  // get underlying token
  const underlyingToken: Interface_Token = changetype<Interface_Token>(
    Token_Query.getToken({
      address: underlyingTokenAddress,
      m_type: Token_TokenType.ERC20,
    }).unwrap(),
  );
  if (!underlyingToken) {
    return null;
  }
  // get underlying token balance
  const balanceRes = Ethereum_Query.callContractView({
    connection: connection,
    address: underlyingToken.address,
    method: "function balanceOf(address account) public view returns (uint256)",
    args: [poolAddress],
  });
  if (balanceRes.isErr) {
    return null;
  }
  return {
    decimals: underlyingToken.decimals,
    balance: balanceRes.unwrap(),
  };
}
