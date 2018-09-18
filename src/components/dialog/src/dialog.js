import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {Button, Table} from 'antd';
import './dialog.less';

function renderShowInputSelect(showInputSelect) {
    if(showInputSelect&&showInputSelect.length){
    return(<div className="show-input">
    {showInputSelect.map((ele,index)=>{
        switch (ele.type){
            case 'detail':
                return (<div className={ele.className+' detail-style'} id={ele.id} key={index}>
                    {ele.title?<span>ele.title</span>:''}
                    <label>{ele.value}</label>
                </div>)
                break;
            case 'select':
                return ''
                break;
            default:
                return ''
        }
    })}
    </div>)
} else {
    return ''
}

}

const Dialog = ({message, dialogContent, dialogWidth, dialogHeight, dialogButton, showInputSelect}) => {
  let columns = [];
  return (
    <div className="dialog-mask">
      <div className="dialog-container" style={{width: dialogWidth, height: dialogHeight}}>
        <div className="dialog-title">
          <span>操作提示</span>
        </div>
        <div className="dialog-message">
          <span>{message}</span>
        </div>
        {renderShowInputSelect(showInputSelect)}
        {dialogContent &&
        <div className="dialog-content" style={{ height: '80%',overflow:'scroll'}}>
          {dialogContent.titles.map((item) => {
            columns.push({'title': item.text, 'dataIndex': item.field,})
          })}
          {/*前端手动加key*/}
          {dialogContent.values.map((item,i)=>{
            item['key']=i;
          })}
          <Table dataSource={dialogContent.values}
                 columns={columns}
                 pagination={{ pageSize: 10 }}
                 rowKey={(item) => item.key}
          />
        </div>
        }
        <div className="dialog-button">
          {dialogButton &&
          dialogButton.map((item, i) => {
            return <Button type={item.type} key={i} className="btn" onClick={item.clickHandle}>{item.text}</Button>;
          })
          }
        </div>
      </div>
    </div>
  );
}

Dialog.propTypes = {
  message: PropTypes.string,
  dialogWidth: PropTypes.string,
  dialogHeight: PropTypes.string,
  dialogButton: PropTypes.arrayOf(PropTypes.object)
};

Dialog.initInstance = (properties) => {
  let props = properties || {};
  let div = document.createElement('div');
  document.body.appendChild(div);
  ReactDOM.render(React.createElement(Dialog, props), div);

  return {
    destroy() {
      ReactDOM.unmountComponentAtNode(div);
      document.body.removeChild(div);
    },
  };
};

export default Dialog;
