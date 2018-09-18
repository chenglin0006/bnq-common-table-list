import React, {Component} from 'react';
import {Table, Form, Button, Pagination} from 'antd';
import Filter from 'bnq-common-filter';
import './index.less';
import moment from 'moment';
import * as Util from './Util';

const WrappedAdvancedFilter = Form.create()(Filter);

class CommonList extends Component {
    constructor(props) {
        super(props);

        this._handleSearch = this._handleSearch.bind(this);
        this._handleReset = this._handleReset.bind(this);
        this._onChangePage = this._onChangePage.bind(this);
        this._onSelectChange = this._onSelectChange.bind(this);
        this._showTotal = this._showTotal.bind(this);
        this.curPage = Util.getUrlArg('curPage') || 1;
        this.pageSize = Util.getUrlArg('pageSize') || 10;

        this.state = {
            curPage: this.curPage,
            pageSize: this.pageSize,
            searchParams: '',
            selectedRowKeys: [],
            selectedRows: [],
        }
    }

    _onChangePage(pagination) {
        let currentPage = pagination.current;
        let searchParams = this.state.searchParams;

        if (searchParams) {
            searchParams['curPage'] = currentPage;
        }
        //翻页操作时，改变当前页
        this.setState({
            curPage: currentPage,
            searchParams: searchParams
        });
        this.props.getCommonList(searchParams);
    }

    _handleReset() {
        this.setState({
            curPage: 1,
            searchParams: {
                curPage: 1,
                pageSize: this.state.pageSize
            }
        });
        this.props.getCommonList({
            curPage: 1,
            pageSize: this.state.pageSize
        });
    }

    _handleSearch(items) {
        let params = {
            curPage: 1,
            pageSize: this.state.pageSize
        }
        //将items中有值的copy到params中
        for (let i in items) {
            if ((items[i] && items[i] !== 'undefined') || items[i] === 0) {
                //将起始时间区分开
                if (i === 'createTime') {
                    let createTimeStart = moment(items[i][0]).format('YYYY-MM-DD HH:mm:ss');
                    let createTimeEnd = moment(items[i][1]).format('YYYY-MM-DD HH:mm:ss');
                    params['createTimeStart'] = createTimeStart;
                    params['createTimeEnd'] = createTimeEnd;
                } else if (i === 'modifyTime') {
                    let modifyTimeStart =moment(items[i][0]).format('YYYY-MM-DD HH:mm:ss');
                    let modifyTimeEnd = moment(items[i][1]).format('YYYY-MM-DD HH:mm:ss');
                    params['modifyTimeStart'] = modifyTimeStart;
                    params['modifyTimeEnd'] = modifyTimeEnd;
                } else if(i === 'startEndTime'){
                    let dateFormat = 'YYYY-MM-DD HH:mm:ss';
                    let startTime = moment(items[i][0]).format(dateFormat);
                    let endTime = moment(items[i][1]).format(dateFormat);
                    params['startTime'] = startTime;
                    params['endTime'] = endTime;
                } else {
                    params[i] = items[i];
                }
            }
            ;
        }
        this.setState({
            searchParams: params
        });
        this.props.getCommonList(params);
    }

    _onSelectChange(selectedRowKeys, selectedRows) {
        this.setState({selectedRowKeys, selectedRows});
    }

    _showTotal(total){
        return `共 ${total} 行`;
    }

    componentWillMount() {
        //首次进入页面时，获取列表信息
        this.props.getCommonList&&this.props.getCommonList({
            curPage: this.state.curPage,
            pageSize: this.state.pageSize
        });


        //首次进入页面时，初始化搜索参数
        this.setState({
            searchParams: {
                curPage: this.state.curPage,
                pageSize: this.state.pageSize
            }
        });

        this.props.getCommonSelect && this.props.getCommonSelect();
    }

    render() {
        const {pagination,
            tableLoading,
            tableDataSource,
            showFilter,
            expandedRowRender,
            expandedRowRenderName,
            buttons,
            showRowSelection=true,
            hideBackBtn=false
        } = this.props;

        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: this._onSelectChange,
        };

        return (
            <div>
                {showFilter && <WrappedAdvancedFilter
                    hideBackBtn={this.props.hideBackBtn}
                    history={this.props.history}
                    filterData={this.props.filterData}
                    handleSearch={this._handleSearch}
                    handleReset={this._handleReset}
                    handleChange={this.props.handleChange}
                    collapseNum={this.props.collapseNum}
                    filterBtnInline={this.props.filterBtnInline}
                />
                }
                <div className='moreBtn'>
                    {
                        buttons&&buttons.map((ele,index)=>{
                            return(
                                <Button key={index} id={ele.id} type="primary" onClick={() => {
                                    let list = [];
                                    tableDataSource&&tableDataSource.forEach((ele)=>{
                                        this.state.selectedRowKeys.forEach((item)=>{
                                            if(ele.id===item){
                                                list.push(ele);
                                            }
                                        })
                                    })
                                    this.setState({selectedRows:list},()=>{
                                        this.props[ele.actionFun](this.state.selectedRows);
                                    });
                                    // this.setState({selectedRowKeys:[]});
                                }}>{ele.name}</Button>
                            )
                        })
                    }
                </div>
                <Table
                    rowClassName={(record, index) => !record[expandedRowRenderName] ? 'hide-expand-btn' : ''}
                    rowSelection={showRowSelection?rowSelection:null}
                    columns={this.props.columns}
                    dataSource={tableDataSource}
                    rowKey={(item) => item.id}
                    loading={tableLoading}
                    onChange={this._onChangePage}
                    expandedRowRender={expandedRowRender}
                    pagination={{
                        position: 'bottom',
                        showQuickJumper: true,
                        defaultCurrent: 1,
                        current: pagination ? pagination.curPage : '',
                        total: pagination ? pagination.totalNum : '',
                        showTotal:this._showTotal
                    }}
                    scroll={this.props.scroll}
                />
            </div>
        );
    }
}

CommonList.propTypes = {}

export default CommonList;
