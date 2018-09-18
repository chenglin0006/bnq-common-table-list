import Dialog from './src/dialog';

/*
 *Dialog对外释放函数默认接口
 *open: 打开弹框
 *close: 关闭弹框
*/
let optionFuns = {
    open: (options = {}) => {
        getDialogInstance(options);
    },
    close: () => {
        if (dialogInstance) {
            dialogInstance.destroy();
            dialogInstance = null;
        }
    }
};

/*
 *Dialog对外属性默认
 *message: 弹框显示信息
 *dialogButton: 弹框默认显示一个取消按钮、确认按钮，他们默认功能关闭弹框
  *类型：PropTypes.arrayOf(PropTypes.object)
  *text: 按钮文字名字
  *type: 按钮类型（来自于antd中Button中type的值）
   *类型: PropTyeps.oneOf(['primary' 'dashed' 'danger', ''])
  *clickHandle: 点击按钮的回调函数，默认为关闭Dialog
    *类型: PropTypes.func
*/
let defaults = {
    message: '',
    showInputSelect:[],
    dialogButton: [
        {
            text: '取消',
            clickHandle: () => {
                optionFuns.close();
            }
        },
        {
          text: '确认',
          type: 'primary',
          clickHandle: () => {
            optionFuns.close();
          }  
        }
    ]
};

let dialogInstance = 0;

let getDialogInstance = (options) => {
    let args = Object.assign({}, defaults, options);
    
    dialogInstance = dialogInstance || Dialog.initInstance({
        ...args
    });
    return dialogInstance;
};

export default optionFuns;