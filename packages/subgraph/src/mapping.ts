import { BigInt, Address } from "@graphprotocol/graph-ts"
import { Chore, People } from "../generated/schema"
import { Purpose, Sender } from "../generated/schema"
import { Chores, AuctionCreated, AuctionBid, ChoreCertified } from "../generated/Chores/Chores"
import { YourContract, SetPurpose } from "../generated/YourContract/YourContract"

export function handleChoreCertified(event: ChoreCertified): void {
  let chore = Chore.load(event.params.auctionId.toString())
  chore.certifiedBy = event.params.certifier.toHexString()
  chore.price = event.params.price

  chore.save()
}

export function handleAuctionBid(event: AuctionBid): void {
  let buyerString = event.params.winner.toHexString()
  let buyer = People.load(buyerString)

  if (buyer == null) {
    buyer = new People(buyerString)
    buyer.address = event.params.winner
    buyer.createdAt = event.block.timestamp
    buyer.amtChoresBought = BigInt.fromI32(1)
  }
  else {
    buyer.amtChoresBought = buyer.amtChoresBought.plus(BigInt.fromI32(1))
  }

  let chore = Chore.load(event.params.auctionId.toString())

  chore.bid = event.params.totalPrice
  chore.buyer = buyerString
  chore.createdAt = event.block.timestamp
  chore.transactionHash = event.transaction.hash.toHex()

  buyer.save()
  chore.save()
}

export function handleNewAuction(event: AuctionCreated): void {
  let sellerString = event.params.creator.toHexString()
  let seller = People.load(sellerString)

  if (seller == null) {
    seller = new People(sellerString)
    seller.address = event.params.creator
    seller.createdAt = event.block.timestamp
    seller.amtChoresSold= BigInt.fromI32(1)
  }
  else {
    seller.amtChoresSold= seller.amtChoresSold.plus(BigInt.fromI32(1))
  }

  let chore = new Chore(event.params.auctionId.toString())

  chore.chore = event.params.chore
  chore.price = event.params.price
  chore.seller = sellerString 
  chore.buyer = "ASDF" 
  chore.createdAt = event.block.timestamp
  chore.transactionHash = event.transaction.hash.toHex()

  seller.save()
  chore.save()
}

export function handleSetPurpose(event: SetPurpose): void {

  let senderString = event.params.sender.toHexString()
  let sender = Sender.load(senderString)

  if (sender == null) {
    sender = new Sender(senderString)
    sender.address = event.params.sender
    sender.createdAt = event.block.timestamp
    sender.purposeCount = BigInt.fromI32(1)
  }
  else {
    sender.purposeCount = sender.purposeCount.plus(BigInt.fromI32(1))
  }

  let purpose = new Purpose(event.transaction.hash.toHex() + "-" + event.logIndex.toString())

  purpose.purpose = event.params.purpose
  purpose.sender = senderString
  purpose.createdAt = event.block.timestamp
  purpose.transactionHash = event.transaction.hash.toHex()

  purpose.save()
  sender.save()
}
