import React from "react";
import ReactDOM from "react-dom";
import { styled } from '@material-ui/styles';
import { makeStyles } from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import {SushiSwap} from '../lib/SushiSwapJs/sushiswap.js'
const Web3 = require("web3");

const MyButton = styled(Button)({
  color:'rgb(91, 57, 38)',
  border:'1px',
  borderStyle:'solid',
  backgroundColor:'rgb(226, 214, 207)',
  '&:hover':{
    color:'rgb(91, 57, 38)'
  }
});
  const MyTable = styled(Table)({
    maxWidth:'100em'
  });
  
  const MyTableDebug = styled(Table)({
    maxWidth:'50em'
  });
class Balance extends React.Component {
  constructor(props){
  	super(props);
    this.state = {
      coinArr:[]
    }
    this.buildSushiSwap = this.buildSushiSwap.bind(this);
    this.SushiSwapEventEmitter = this.SushiSwapEventEmitter.bind(this);
    this.connectToMetaMask = this.connectToMetaMask.bind(this);
  }
  async buildSushiSwap(web3){
    let ss = new SushiSwap(web3)
    let coinArr = [];
    await ss.getInfo(window.ethereum.selectedAddress)
    let bar = await ss.getBar(window.ethereum.selectedAddress);
    await bar.poll();

    console.log(ss);//parseFloat(Web3.utils.fromWei(ss.pools[12].totalSushiPerBlock.toString()),'ether'),parseFloat(Web3.utils.fromWei(ss.pools[12].devShare.toString()),'ether'))
    // DEBUGGING
    this.setState({
      baseSushiPerBlock:parseFloat(Web3.utils.fromWei(ss.base.sushiPerBlock.toString()),'ether'),
      sushiReward:parseFloat(Web3.utils.fromWei(ss.pools[12].sushiReward.toString()),'ether'),
      devShare:parseFloat(Web3.utils.fromWei(ss.pools[12].devShare.toString()),'ether'),
      sushiRewardInETH:parseFloat(Web3.utils.fromWei(ss.pools[12].sushiRewardInETH.toString()),'ether'),
      sushiRewardInCurrency:parseFloat(Web3.utils.fromWei(ss.pools[12].sushiRewardInCurrency.toString())*1000000000000,'ether'),
      totalSushiPerBlock:parseFloat(Web3.utils.fromWei(ss.pools[12].totalSushiPerBlock.toString()),'ether'),
      hourlyROI:parseFloat(Web3.utils.fromWei(ss.pools[12].hourlyROI.toString()),'ether'),
      dailyROI:parseFloat(Web3.utils.fromWei(ss.pools[12].dailyROI.toString()),'ether'),
      hourlyInCurrency:parseFloat(Web3.utils.fromWei(ss.pools[12].hourlyInCurrency.toString()),'ether'),
      dailyInCurrency:parseFloat(Web3.utils.fromWei(ss.pools[12].dailyInCurrency.toString())*1000000000000,'ether'),
    })


    let poolTokens = [];
    let poolTokensTotal=0;
    let poolTokensTotalPending = 0;
    let totalValue = 0;
    let sushiInSushiPoolETH=0;
    let ethInSushiPoolETH=0;

    for(let i=0;i<ss.pools.length;i++){
      poolTokensTotal+=parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken0.toString(),'ether')) + parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken1.toString(),'ether'))
      if(i === ss.sushi_pool){
        sushiInSushiPoolETH=parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken0.toString(),'ether')) * parseFloat(Web3.utils.fromWei(ss.base.sushiRate.toString(),'ether')); 
        ethInSushiPoolETH=parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken1.toString(),'ether'));
      }
      poolTokensTotalPending+=parseFloat(Web3.utils.fromWei(ss.pools[i].pending.toString(),'ether'))
      poolTokens.push({
        poolName:ss.pools[i].name,
        userBalanceLPs:ss.pools[i].balance
      })
    }
    let mySushi = (parseFloat(Web3.utils.fromWei(ss.base.sushiBalance.toString(),'ether')) + (parseFloat(Web3.utils.fromWei(bar.sushiStake.toString(),'ether'))) + sushiInSushiPoolETH).toFixed(4);
    let priceUSD = (parseFloat(Web3.utils.fromWei(ss.base.sushiValueInCurrency.toString(),'ether'))*1000000000000).toFixed(2);
    let mySushiUSD = (mySushi * priceUSD).toFixed(2);
    coinArr.push({
      name:'sushi',
      logo: ss.pools[ss.sushi_pool].logo,
      mySushi:mySushi,
      myUSD:mySushiUSD,
      walletBalance:Web3.utils.fromWei(ss.base.sushiBalance.toString(),'ether'),
      priceUSD:priceUSD,
      poolTokensTotal:poolTokensTotal.toFixed(4),
      poolTokensPending:poolTokensTotalPending.toFixed(4),
      sushiInSushiPoolETH:(sushiInSushiPoolETH - poolTokensTotalPending).toFixed(4),
      ethInSushiPoolETH:ethInSushiPoolETH.toFixed(4),
      xsushi:(parseFloat(Web3.utils.fromWei(bar.sushiStake.toString(),'ether'))).toFixed(2),
      address: ss.base.sushi,
    })
    this.setState({
      coinArr:coinArr
    })
  }

  async SushiSwapEventEmitter(web3){
    web3.eth.subscribe('newBlockHeaders', async () =>{
        this.buildSushiSwap(web3);
      });
  }

  async connectToMetaMask(){
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      let web3 = new Web3(window.ethereum);
      this.buildSushiSwap(web3);
      this.SushiSwapEventEmitter(web3);
    }
  }

  render() {
    return (
      <div>
      <MyButton variant="outlined" color="white" onClick={() => this.connectToMetaMask()}>Connect To MetaMask</MyButton>
        <br/>
        <br/>
        <br/>
          <TableContainer component={Paper}>
            <MyTable aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Asset</TableCell>
                  <TableCell align="center">My Sushi</TableCell>
                  <TableCell align="center">USD Value</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Wallet Balance</TableCell>
                  <TableCell align="center">xSushi</TableCell>
                  <TableCell align="center">Amount To be Harvested</TableCell>
                  <TableCell align="center">Sushi Pool</TableCell>
                  <TableCell align="center">Total Amt Staked in all Pools</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {this.state.coinArr.map((row,index) => (
                  <TableRow key={index}>
                    <TableCell align="center" component="th" scope="row"> {row.name} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.mySushi} {row.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> ${row.myUSD} </TableCell>
                    <TableCell align="center" component="th" scope="row"> ${row.priceUSD}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.walletBalance} {row.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.xsushi} {row.logo}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.poolTokensPending} {row.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.sushiInSushiPoolETH} {row.logo} & {row.ethInSushiPoolETH} ETH</TableCell>
                    <TableCell align="center" component="th" scope="row"> {row.poolTokensTotal} ETH </TableCell>
                  </TableRow>
                  ))}
              </TableBody>
            </MyTable>
          </TableContainer>
          <br/>
          <br/>
          <br/>
          <br/>
          In beta, still verifying calcs.
          <br/>
          Source: <a href="https://github.com/cryptogluon/sushi-balance">https://github.com/cryptogluon/sushi-balance</a>
          <br/>
          Twitter: <a href="https://twitter.com/cryptogluon">https://twitter.com/cryptogluon</a>
          <br/>
          <br/>
          <br/>
          <br/>
          Debugging:<br/>
          <TableContainer component={Paper}>
          <MyTableDebug aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center"></TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  <TableRow key={1}>
                    <TableCell align="center" component="th" scope="row"> base.sushiPerBlock </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.baseSushiPerBlock}</TableCell>
                  </TableRow>
                  <TableRow key={2}>
                    <TableCell align="center" component="th" scope="row"> pool.sushiReward</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.sushiReward}</TableCell>
                    </TableRow>
                  <TableRow key={22}>
                    <TableCell align="center" component="th" scope="row"> pool.devShare</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.devShare}</TableCell>
                    </TableRow>
                  <TableRow key={3}>
                    <TableCell align="center" component="th" scope="row"> pool.sushiRewardInETH </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.sushiRewardInETH}</TableCell>
                    </TableRow>
                  <TableRow key={4}>
                    <TableCell align="center" component="th" scope="row"> pool.sushiRewardInCurrency</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.sushiRewardInCurrency}</TableCell>
                    </TableRow>
                  <TableRow key={5}>
                    <TableCell align="center" component="th" scope="row"> pool.totalSushiPerBlock</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.totalSushiPerBlock}</TableCell>
                    </TableRow>
                  <TableRow key={6}>
                    <TableCell align="center" component="th" scope="row"> pool.hourlyROI</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.hourlyROI}</TableCell>
                    </TableRow>
                  <TableRow key={7}>
                    <TableCell align="center" component="th" scope="row"> pool.dailyROI</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.dailyROI}</TableCell>
                    </TableRow>
                  <TableRow key={8}>
                    <TableCell align="center" component="th" scope="row"> pool.hourlyInCurrency</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.hourlyInCurrency}</TableCell>
                    </TableRow>
                  <TableRow key={9}>
                    <TableCell align="center" component="th" scope="row"> pool.dailyInCurrency</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.dailyInCurrency}</TableCell>
                  </TableRow>
              </TableBody>
            </MyTableDebug>
          </TableContainer>
           


        </div>

      );
  }
};

ReactDOM.render(<Balance/>, document.getElementById("balance"));
export default Balance;


