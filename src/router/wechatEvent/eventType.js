import request from 'request-promise';
import memberList from '../../models/member/index.js';
import departmentList from '../../models/department/index.js';
//import memberTags from '../../models/memberTags/index.js';
import tagMemberList from '../../models/tagMemberList/index.js';
import customerList from '../../models/customer/index.js';
import customerDetails from '../../models/customerDetails/index.js';
import customerGroupDetails from '../../models/customerGroupDetails/index.js';
//import customerCorpTags from '../../models/customerCorpTags/index.js';
//import memberQrCode from '../../models/memberQrCode/index.js';
import config from '../../config/index.js';

// const menu = {
//   // 成员关注及取消关注事件 [ subscribe(关注)、unsubscribe(取消关注) ]
//   subscribe: 1,
//   unsubscribe: 2,
//   // 本事件在成员进入企业微信的应用时触发
//   enter_agent,
//   // 上报地理位置
//   LOCATION,
//   // 点击菜单拉取消息的事件推送
//   click,
//   // 点击菜单跳转链接的事件推送
//   view,
//   // 扫码推事件的事件推送
//   scancode_push,
//   // 扫码推事件且弹出“消息接收中”提示框的事件推送
//   scancode_waitmsg,
//   // 弹出系统拍照发图的事件推送
//   pic_sysphoto,
//   // 弹出拍照或者相册发图的事件推送
//   pic_photo_or_album,
//   // 弹出微信相册发图器的事件推送
//   pic_weixin,
//   // 弹出地理位置选择器的事件推送
//   location_select,
//   // 审批状态通知事件
//   open_approval_change,
//   // 任务卡片事件推送
//   taskcard_click,
//   // 共享应用事件回调
//   share_agent_change
// };


// 成员变动回调 xml 处理
const changeUser = (msgBody) => {
  //let {UserID, Name, Department, MainDepartment, IsLeaderInDept, IsLeader, Mobile, Position, Gender, Email, Status, Avatar, Alias, Telephone, Address, ExtAttr} = msgBody;
  const data = {};
  for (const key in msgBody) {
    if (key === 'MainDepartment') {
      data['main_department'] = msgBody[key];
    } else if (key === 'Department') {
      data['department'] = msgBody[key].split(',').map(item => Number(item));
    } else if (key === 'IsLeaderInDept') {
     data['is_leader_in_dept'] = msgBody[key]
    } else if (key === 'ExtAttr') {
      data.extattr = msgBody.ExtAttr.map(item => {
        const obj = {
          name: item.Name,
          type: item.Type
        };

        item.Value && (obj.value = item.Value);
        item.Text && (obj.text = {value: item.Text.Value});
        item.Web && (obj.web = {url: item.Web.Url, title: item.Web.Title});

        return obj;
      });
    } else {
      data[key.toLowerCase()] = msgBody[key];
    }
  }

  return data;
};

// 部门变动回调 xml 处理
const changeDepartment = (msgBody) => {
  const data = {};
  for (const key in msgBody) {
    data[key.toLowerCase()] = msgBody[key];
  }
  data._id = data.id;

  return data;
};

// 客户信息变更回调处理
const changeCustomer = (msgBody) => {
  console.log();
};

export const event = {
  // 异步任务完成事件推送 [ sync_user(增量更新成员)、 replace_user(全量覆盖成员）、invite_user(邀请成员关注）、replace_party(全量覆盖部门) ]
  batch_job_result: {
    sync_user: 1,
    replace_user: 2,
    invite_user: 3,
    replace_party: 4
  },
  // 成员变更通知
  change_contact: {
    // 新增成员事件
    create_user: async (msgBody) => {
      const data = changeUser(msgBody);
      const res = await memberList.create(data);
      return res;
    },
    // 更新成员事件
    update_user: async (msgBody) => {
      const data = changeUser(msgBody);
      const res = await memberList.updateOne({userid: data.userid}, data);
      return res;
    },
    // 删除成员事件
    delete_user: async (msgBody) => {
      const res = await memberList.deleteOne({userid: msgBody.UserID});
      return res;
    },
    // 新增部门通知
    create_party: async (msgBody) => {
      const data = changeDepartment(msgBody);
      const res = await departmentList.create(data);
      return res;
    },
    // 更新部门事件
    update_party: async (msgBody) => {
      const data = changeDepartment(msgBody);
      const res = await departmentList.updateOne({id: data.id}, data);
      return res;
    },
    // 删除部门事件
    delete_party: async (msgBody) => {
      const res = await departmentList.deleteOne({id: msgBody.Id});
      return res;
    },
    // 标签成员变更通知
    update_tag: async (msgBody) => {
      await request({
        url: `${config.app_momain}test/tag/${msgBody.TagId}`,
        json: true
      });
    }
  },

  // 以下是客户的
  // 事件名字
  change_external_contact: {
    // 事件类型
    // 添加企业客户事件
    add_external_contact: async (msgBody) => {
      await request({
        url: `${config.app_momain}test/customerDetail/${msgBody.ExternalUserID}`,
        json: true
      });
    },
    // 编辑企业客户事件
    edit_external_contact: async (msgBody) => {
      await request({
        url: `${config.app_momain}test/customerDetail/${msgBody.ExternalUserID}`,
        json: true
      });
    },
    // 外部联系人免验证添加成员事件
    add_half_external_contact: (msgBody) => {
      // 这个是[客户联系里面的 扫二维码加入才有的]
      console.log(msgBody, '外部联系人免验证添加成员事件');
    },
    // 删除企业客户事件
    del_external_contact: async (msgBody) => {
      const data = await customerDetails.findOne({_id: msgBody.ExternalUserID});
      let len = data.follow_user.length;
      if (len > 1)  {
        while (len--) {
          const item = data.follow_user[len];
          item.userid === msgBody.UserId && data.follow_user.splice(len, 1) && (len = 0);
        }
        customerDetails.updateOne({_id: msgBody.ExternalUserID}, data);
      } else {
        customerDetails.deleteOne({_id: msgBody.ExternalUserID});
      }
    },
    // 删除跟进成员事件 [客户先删除成员]
    del_follow_user: (msgBody) => {
      // TODO 可建群一个，收客户删除成员的 应用消息 通知
      console.log(msgBody, '客户先删除成员事件');
    },
    // 客户接替失败事件 !**要做判断 [ 接替失败的原因  1、customer_refused-客户拒绝， 2、customer_limit_exceed-接替成员的客户数达到上限 ]
    transfer_fail: (msgBody) => {
      console.log(msgBody, '客户接替失败事件');
    }
  },
  // 客户群创建事件
  change_external_chat: {
    create: async (msgBody) => {
      await request({
        url: `${config.app_momain}test/customerGroupDetail/${msgBody.ChatId}`,
        json: true
      });
    },
    update: async (msgBody) => {
      // TODO 像这种再请求的应该不能请求，应该提取方法多地调用，多一次请求性能浪费
      await request({
        url: `${config.app_momain}test/customerGroupDetail/${msgBody.ChatId}`,
        json: true
      });
    },
    dismiss: async (msgBody) => {
      const res = await customerGroupDetails.deleteOne({_id: msgBody.ChatId});
      return res;
    }
  },
  // 企业客户标签创建事件
  change_external_tag: {
    create: async (msgBody) => {
      msgBody.TagType === 'tag' && await request({
        url: `${config.app_momain}test/customerCorpTagsUpdate`,
        method: 'post',
        body: {
          tag_id: msgBody.Id
        },
        json: true
      });
    },
    update: (msgBody) => {
      console.log(msgBody, 'keHuQun-22222222');
    },
    delete: (msgBody) => {
      console.log(msgBody, 'keHuQun-33333333');
    }
  }
};

