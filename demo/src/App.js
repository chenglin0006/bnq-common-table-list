import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import CommonList from '../../src/index'

class App extends Component {
    constructor(props) {
        super(props);
        this.testClick = this.testClick.bind(this);
        this._getCommonList = this._getCommonList.bind(this);
        this.state={
            searchParams:{},
            tableSourceData:[],
            pagination:{
                curPage:1,
                totalNum:161,
                prePage:0,
                totalPage:17,
                nextPage:0,
                pageSize:10
            }
        }

    }
    _getCommonList(params){
        console.log(params);
        let pagination = this.state.pagination;
        pagination.curPage = params.curPage;
        let arry = [
            {activityName:'1231',activityTypeStr:'13123123',statusStr:'1231',id:1},
            {activityName:'1231',activityTypeStr:'13123123',statusStr:'1231',id:2},
        ]
        this.setState({tableSourceData:arry,pagination:pagination})
    }
    testClick(){
        console.log('123123');
    }
  render() {
      let columns = [
          {title: '活动名称', dataIndex: 'activityName', width: 150},
          {title: '活动类型', dataIndex: 'activityTypeStr', width: 100},
          {title: '状态', dataIndex: 'statusStr', width: 100},
      ];
      let tableDataSource = this.state.tableSourceData;
        const props = {
            columns:columns,
            tableDataSource:tableDataSource,
            getCommonList:this._getCommonList,
            pagination:this.state.pagination
        }
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
          <CommonList {...props}></CommonList>
      </div>
    );
  }
}

export default App;
