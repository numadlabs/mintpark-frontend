import { getTransactionHex, getUtxos } from "@/utils/libs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { txId, verbose, blockHash } = await req.json();

  try {
    const response = await getTransactionHex(txId, verbose, blockHash);
    return NextResponse.json({ status: 200, data: response, message: null });
  } catch (error) {
    return NextResponse.json({ status: 500, data: null, message: error });
  }
}
