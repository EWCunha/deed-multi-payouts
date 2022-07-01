const DeedMultiPayout = artifacts.require("DeedMultiPayout")

const increaseTime = async (seconds) => {
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_increaseTime',
        params: [seconds],
        id: 0,
    }, () => { })
    await web3.currentProvider.send({
        jsonrpc: '2.0',
        method: 'evm_mine',
        params: [],
        id: 0,
    }, () => { })
}

contract("DeedMultiPayout", (accounts) => {
    let deedMultiPayout
    beforeEach(async () => {
        deedMultiPayout = await DeedMultiPayout.new(
            accounts[0],
            accounts[1],
            1,
            { from: accounts[0], value: 100 }
        )
    })

    it("should withdraw for all payouts (1)", async () => {
        // console.log(deedMultiPayout)
        await increaseTime(1)
        for (let i = 0; i < 4; i++) {
            const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[1]))
            // await new Promise(resolve => setTimeout(resolve, 1000))
            await deedMultiPayout.withdraw({ from: accounts[0] })
            await new Promise(resolve => setTimeout(resolve, 1000))
            const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[1]))
            console.log(balanceAfter.sub(balanceBefore).toNumber())
            assert(balanceAfter.sub(balanceBefore).toNumber() === 25)
        }
    })

    it("should withdraw for all payouts (2)", async () => {
        for (let i = 0; i < 2; i++) {
            const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[1]))
            await new Promise(resolve => setTimeout(resolve, 2000))
            await increaseTime(2)
            await deedMultiPayout.withdraw({ from: accounts[0] })
            const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[1]))

            assert(balanceAfter.sub(balanceBefore).toNumber() === 50)
        }
    })

    it("should NOT withdraw if too early", async () => {
        try {
            await deedMultiPayout.withdraw({ from: accounts[0] })
        } catch (e) {
            assert(e.message.includes("too early"))
            return
        }
        assert(false)
    })

    it("should NOT withdraw if not lawyer", async () => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            await increaseTime(1)
            await deedMultiPayout.withdraw({ from: accounts[5] })
        } catch (e) {
            assert(e.message.includes("lawyer only"))
            return
        }
        assert(false)
    })

    it("should NOT withdraw if no payouts left", async () => {
        await new Promise((resolve) => setTimeout(resolve, 4000))
        await increaseTime(4)
        await deedMultiPayout.withdraw({ from: accounts[0] })
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            await increaseTime(1)
            await deedMultiPayout.withdraw({ from: accounts[0] })
        } catch (e) {
            assert(e.message.includes("no payouts left"))
            return
        }
        assert(false)
    })

})