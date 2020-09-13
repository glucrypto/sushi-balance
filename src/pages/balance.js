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

import detectEthereumProvider from '@metamask/detect-provider'
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

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

const sushiFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2
})

class Balance extends React.Component {
  constructor(props){
  	super(props);
    this.state = {
      coinArr:{
        name:'sushi',
        logo: '',
        mySushi:0,
        myUSD:0,
        walletBalance:0,
        priceUSD:0,
        priceETHUSD:0,
        priceTotal:0,
        poolTokensNotStaked:0,
        poolTokensStaked:0,
        sushiLPStaked:0,
        poolTokensTotal:0,
        poolTokensPending:0,
        sushiInSushiPoolETH:0,
        ethInSushiPoolETH:0,
        xsushiStaked:0,
        xsushiToBeCollected:0,
        xsushiTotal:0,
        sushiInBar:0,
        xsushiValInSushi:0,
        barSushiUSD:0,
        address: 0,
      }
    }
    this.buildSushiSwap = this.buildSushiSwap.bind(this);
    this.SushiSwapEventEmitter = this.SushiSwapEventEmitter.bind(this);
    this.connectToMetaMask = this.connectToMetaMask.bind(this);
  }
  async buildSushiSwap(web3){
    let ss = new SushiSwap(web3)
    let coinArr = {};
    await ss.getInfo(window.ethereum.selectedAddress)
    let bar = await ss.getBar(window.ethereum.selectedAddress);
    await bar.poll();

    //console.log(bar);//parseFloat(Web3.utils.fromWei(ss.pools[12].totalSushiPerBlock.toString()),'ether'),parseFloat(Web3.utils.fromWei(ss.pools[12].devShare.toString()),'ether'))
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
    let poolTokensNotStaked=0;
    let poolTokensStaked=0;
    let sushiLPStaked=0;

    for(let i=0;i<ss.pools.length;i++){
      poolTokensTotal+=parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken0.toString(),'ether')) + parseFloat(Web3.utils.fromWei(ss.pools[i].valueUserStakedToken1.toString(),'ether'))
      if(i === ss.sushi_pool){
        sushiInSushiPoolETH=parseFloat(Web3.utils.fromWei(ss.pools[i].userStakedToken0.toString(),'ether')); 
        ethInSushiPoolETH=parseFloat(Web3.utils.fromWei(ss.pools[i].userStakedToken1.toString(),'ether'));
        sushiLPStaked=parseFloat(Web3.utils.fromWei(ss.pools[i].balance.toString(),'ether'))
      }
      poolTokensTotalPending+=parseFloat(Web3.utils.fromWei(ss.pools[i].pending.toString(),'ether'))
      poolTokensNotStaked += parseFloat(Web3.utils.fromWei(ss.pools[i].uniBalance.toString(),'ether'))
      poolTokensStaked += parseFloat(Web3.utils.fromWei(ss.pools[i].balance.toString(),'ether'))
      
      //console.log(poolTokensTotalPending)
      poolTokens.push({
        poolName:ss.pools[i].name,
        userBalanceLPs:ss.pools[i].balance
      })

    }
    let mySushi = (parseFloat(Web3.utils.fromWei(ss.base.sushiBalance.toString(),'ether')) + (parseFloat(Web3.utils.fromWei(bar.sushiStake.toString(),'ether'))) + sushiInSushiPoolETH  + poolTokensTotalPending).toFixed(4);
    let priceUSD = parseFloat(Web3.utils.fromWei(ss.base.sushiValueInCurrency.toString(),'ether'))*1000000000000;
    let mySushiUSD = parseFloat(mySushi * priceUSD);
    let myETHUSD = parseFloat(ethInSushiPoolETH) * parseFloat(Web3.utils.fromWei(ss.base.eth_rate.toString(),'ether'))*1000000000000;
    //console.log(Web3.utils.fromWei(ss.base.eth_rate.toString(),'ether'))
    let totalUSD = parseFloat(myETHUSD) + parseFloat(mySushiUSD);
    let xsushiValInSushi = (parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether')) / parseFloat(Web3.utils.fromWei(bar.totalXSushi.toString(),'ether'))).toFixed(4)
    //let xsushiValInUSD = xsushiValInSushi(parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether'))).toFixed(4);
    let barSushiUSD = (parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether'))*priceUSD);

    coinArr = {
      name:'sushi',
      logo: ss.pools[ss.sushi_pool].logo,
      mySushi:mySushi,
      myUSD:formatter.format(mySushiUSD),
      walletBalance:Web3.utils.fromWei(ss.base.sushiBalance.toString(),'ether'),
      priceUSD:formatter.format(priceUSD),
      priceETHUSD:formatter.format(myETHUSD),
      priceTotal:formatter.format(totalUSD),
      poolTokensNotStaked:poolTokensNotStaked,
      poolTokensStaked:poolTokensStaked.toFixed(4),
      sushiLPStaked:sushiLPStaked.toFixed(4),
      poolTokensTotal:poolTokensTotal.toFixed(4),
      poolTokensPending:poolTokensTotalPending.toFixed(4),
      sushiInSushiPoolETH:(sushiInSushiPoolETH).toFixed(4),
      ethInSushiPoolETH:ethInSushiPoolETH.toFixed(4),
      xsushiStaked:(parseFloat(Web3.utils.fromWei(bar.xsushi.toString(),'ether'))).toFixed(4),
      xsushiToBeCollected:(parseFloat(Web3.utils.fromWei(bar.sushiStake.toString(),'ether'))-(parseFloat(Web3.utils.fromWei(bar.xsushi.toString(),'ether')))).toFixed(4),
      xsushiTotal:sushiFormatter.format(parseFloat(Web3.utils.fromWei(bar.totalXSushi.toString(),'ether'))),
      sushiInBar:sushiFormatter.format(parseFloat(Web3.utils.fromWei(bar.barSushi.toString(),'ether'))),
      xsushiValInSushi:xsushiValInSushi,
      barSushiUSD:formatter.format(barSushiUSD),
      address: ss.base.sushi,
    }
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
    const provider = await detectEthereumProvider()
    if(provider){
    //if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      let web3 = new Web3(window.ethereum);
      this.buildSushiSwap(web3);
      this.SushiSwapEventEmitter(web3);
    }
  }
  
  render() {
    return (
      <div class="balance-main">
      <MyButton variant="outlined" color="white" onClick={() => this.connectToMetaMask()}>Connect To MetaMask</MyButton><br/><br/>
      {/*<MyButton href="https://metamask.app.link/dapp/sushi-balance.herokuapp.com/" variant="outlined" color="white">Connect To MetaMask Mobile</MyButton>*/}
      {/*  <br/>
        <br/>*/}
        <br/>
        <div class="main-grid">
          <div class="item-top">
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Asset</TableCell>
                  <TableCell align="center">My Sushi</TableCell>
                  <TableCell align="center">Price</TableCell>
                  <TableCell align="center">Sushi USD Value</TableCell>
                  <TableCell align="center">ETH USD Value</TableCell>
                  <TableCell align="center">Total USD Value</TableCell>
                  <TableCell align="center">Wallet Balance</TableCell>
                  <TableCell align="center">xSushi Staked</TableCell>
                  <TableCell align="center">xSushi Rewards</TableCell>
                  <TableCell align="center">Amount To be Harvested</TableCell>
                  <TableCell align="center">Sushi Pool (Staked)*</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>             
                  <TableRow key={1}>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.name} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.mySushi} {this.state.coinArr.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.priceUSD}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.myUSD} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.priceETHUSD} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.priceTotal}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.walletBalance} {this.state.coinArr.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiStaked} {this.state.coinArr.logo}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiToBeCollected} {this.state.coinArr.logo}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.poolTokensPending} {this.state.coinArr.logo} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.sushiInSushiPoolETH} {this.state.coinArr.logo}</TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          </div>

          <div class="item-xsushi">
          <br/>
          xSushi Info
          <br/>
          <br/>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Sushi In Bar</TableCell>
                  <TableCell align="center">Total xSushi supply</TableCell>
                  <TableCell align="center">Sushi/xSushi Ratio</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  <TableRow key={1}>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.sushiInBar} {this.state.coinArr.logo} = {this.state.coinArr.barSushiUSD}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiTotal}</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.xsushiValInSushi} {this.state.coinArr.logo}</TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          
          </div>

          <div class="item-pool">
          <br/>
          Your Pool / LP info:
          <br/>
          <br/>
          <TableContainer component={Paper}>
            <Table aria-label="simple table" size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Total LP Tokens Not Staked</TableCell>
                  <TableCell align="center">Total LP tokens Staked</TableCell>
                  <TableCell align="center">Total ETH Value Staked in all Pools</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  <TableRow key={1}>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.poolTokensNotStaked} </TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.poolTokensStaked} LP</TableCell>
                    <TableCell align="center" component="th" scope="row"> {this.state.coinArr.poolTokensTotal} ETH </TableCell>
                    {/*<TableCell align="center" component="th" scope="row"> {this.state.coinArr.sushiLPStaked} SLP = {this.state.coinArr.sushiInSushiPoolETH} {this.state.coinArr.logo} & {this.state.coinArr.ethInSushiPoolETH} ETH</TableCell>*/}
                  </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
          </div>
          <div class="item-info">
          <br/>
          <br/>
          <br/>
          <br/>
          <b>Questions/help refer to:</b> <a target="_blank" href="https://help.sushidocs.com/">https://help.sushidocs.com</a> (will show in Lp's unstaked)<br/>
          In <b>beta</b>, still verifying calcs.
          <br/>
          Source: <a target="_blank" href="https://github.com/cryptogluon/sushi-balance">https://github.com/cryptogluon/sushi-balance</a>
          <br/>
          Props to barjman for most of the web3 hooks: <a target="_blank" href="https://github.com/bartjman/SushiSwapJs">https://github.com/bartjman/SushiSwapJs</a>
          <br/>
          Twitter: <a target="_blank" href="https://twitter.com/cryptogluon">https://twitter.com/cryptogluon</a>
          <br/>
          <br/>
          <br/>
          <br/>
          </div>
          </div>
           


        </div>

      );
  }
};

ReactDOM.render(<Balance/>, document.getElementById("balance"));
export default Balance;


