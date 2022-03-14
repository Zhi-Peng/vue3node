import Router from 'koa-router';
import request from 'request-promise';
import memberList from '../../../models/member/index.js';
import departmentList from '../../../models/department/index.js';
import memberTags from '../../../models/memberTags/index.js';
import tagMemberList from '../../../models/tagMemberList/index.js';
import customerList from '../../../models/customer/index.js';
import customerDetails from '../../../models/customerDetails/index.js';
import customerGroupDetails from '../../../models/customerGroupDetails/index.js';
import customerCorpTags from '../../../models/customerCorpTags/index.js';
import memberQrCode from '../../../models/memberQrCode/index.js';
const router = new Router();

// 同步企业所有成员详情
router.get('/allMemberTest', async (ctx, next) => {
  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}user/list?access_token=${ctx.accessToken}&department_id=1&fetch_child=1`,
    json: true
  });

  try {
    // TODU 这里要优化， 重复的数据插入不了   ordered = false 就是让插入过的不再插入
    const res = await memberList.insertMany(data.userlist, { ordered: false });
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});

// 同步部门成员
router.get('/department', async (ctx, next) => {
  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}user/simplelist?access_token=${ctx.accessToken}&department_id=1&fetch_child=1`,
    json: true
  });

  try {
    // TODU 这里要优化， 重复的数据插入不了
    const res = await memberList.insertMany(data.userlist, { ordered: false });
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});

// 同步部门列表
router.get('/departmentlist', async (ctx, next) => {
  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}department/list?access_token=${ctx.accessToken}&department_id=1`,
    json: true
  });
  data.department.map(item => {
    item._id = item.id;
    return item;
  });
  try {
    // TODU 这里要优化， 重复的数据插入不了
    const res = await departmentList.insertMany(data.department);
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});

// 同步标签列表
router.get('/taglist', async (ctx, next) => {
  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}tag/list?access_token=${ctx.accessToken}`,
    json: true
  });
  data.taglist.map(item => {
    item._id = item.tagid;
    return item;
  });
  try {
    // TODU 这里要优化， 重复的数据插入不了
    const res = await memberTags.insertMany(data.taglist);
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});

// 同步标签成员
router.get('/tag/:tagid', async (ctx, next) => {
  const tagid = ctx.request.params.tagid;
  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}tag/get?access_token=${ctx.accessToken}&tagid=${tagid}`,
    json: true
  });

  data._id = data.tagname;
  delete data.errcode;
  delete data.errmsg;

  try {
    // TODU 这里要优化， 重复的数据插入不了
    const res = await tagMemberList.update({ _id: data._id }, data, { upsert: true });
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});

/**
 * 客户的接口
 */

// 同步客户列表
router.get('/externalcontact/:userid', async (ctx, next) => {
  const userid = ctx.request.params.userid;
  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}externalcontact/list?access_token=${ctx.accessToken}&userid=${userid}`,
    json: true
  });
  delete data.errcode;
  delete data.errmsg;

  try {
    // TODU 这里要优化， 重复的数据插入不了
    const res = await customerList.create(data);
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});

// 同步所以客户详情
router.get('/allCustomerDetail', async (ctx, next) => {
  const members = await memberList.find({}, { _id: 0, userid: 1 });

  // TODO limit 写死的,后期写活
  let allCustomer = members.map(item => {
    return request({
      url: `${ctx.$config.wechatBaseUrl}externalcontact/batch/get_by_user?access_token=${ctx.accessToken}`,
      method: 'post',
      body: {
        userid: item.userid,
        limit: 10000
      },
      json: true
    });
  });
  allCustomer = await Promise.all(allCustomer);

  const obj = {};
  allCustomer.forEach(item => {
    item.external_contact_list.forEach(customerItem => {
      if (obj[customerItem.external_contact.external_userid]) {
        obj[customerItem.external_contact.external_userid]['follow_user'].push(
          customerItem.follow_info
        );
      } else {
        customerItem['follow_user'] = [customerItem.follow_info];
        delete customerItem.follow_info;
        obj[customerItem.external_contact.external_userid] = customerItem;
      }
    });
  });
  const data = Object.keys(obj).map(item => {
    obj[item]['_id'] = obj[item]['external_contact']['external_userid'];
    return obj[item];
  });

  try {
    // TODU 这里要优化， 重复的数据插入不了
    const res = await customerDetails.insertMany(data, { ordered: false });
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});

// 同步单个客户详情
router.get('/customerDetail/:externalUserid', async (ctx, next) => {
  const externalUserid = ctx.request.params.externalUserid;
  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}externalcontact/get?access_token=${ctx.accessToken}&external_userid=${externalUserid}`,
    json: true
  });

  const res = await customerDetails.updateOne({ _id: externalUserid }, data, { upsert: true });
  ctx.success(res);
});

// 同步所有客户群详情
router.get('/customerGroupDetail', async (ctx, next) => {
  let data = await request({
    url: `${ctx.$config.wechatBaseUrl}externalcontact/groupchat/list?access_token=${ctx.accessToken}`,
    method: 'post',
    body: {
      status_filter: 0,
      // owner_filter: {
      //   userid_list: ['ZhuZhiPen']
      // },
      // cursor : "r9FqSqsI8fgNbHLHE5QoCP50UIg2cFQbfma3l2QsmwI",
      limit: 10
    },
    json: true
  });

  data = data.group_chat_list.map(item => {
    return request({
      url: `${ctx.$config.wechatBaseUrl}externalcontact/groupchat/get?access_token=${ctx.accessToken}`,
      method: 'post',
      body: {
        chat_id: item.chat_id
      },
      json: true
    });
  });

  data = await Promise.all(data);
  data = data.map(item => {
    item.group_chat._id = item.group_chat.chat_id;
    return item.group_chat;
  });

  const res = await customerGroupDetails.insertMany(data, { ordered: false });
  ctx.success(res);
});

// 同步客户群详情
router.get('/customerGroupDetail/:chatId', async (ctx, next) => {
  const chat_id = ctx.request.params.chatId;
  let data = await request({
    url: `${ctx.$config.wechatBaseUrl}externalcontact/groupchat/get?access_token=${ctx.accessToken}`,
    method: 'post',
    body: {
      chat_id
    },
    json: true
  });
  data.group_chat._id = data.group_chat.chat_id;

  const res = await customerGroupDetails.updateOne({ _id: chat_id }, data.group_chat, {
    upsert: true
  });
  ctx.success(res);
});

// 获取企业标签库
router.post('/customerCorpTags', async (ctx, next) => {
  const body = ctx.request.body;

  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}externalcontact/get_corp_tag_list?access_token=${ctx.accessToken}`,
    method: 'post',
    body,
    json: true
  });

  try {
    const res = await customerCorpTags.insertMany(data.tag_group, { ordered: false });
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});
router.post('/ddddd', async ctx => {
  const ff = await b.test.aggregate([{ $group: { _id: '$author', books: { $push: '$title' } } }]);
});
// 更新企业标签[可与上个接口提出来合并]
router.post('/customerCorpTagsUpdate', async (ctx, next) => {
  //const body = ctx.request.body;

  //const data = await request({
  //url: `${ctx.$config.wechatBaseUrl}externalcontact/get_corp_tag_list?access_token=${ctx.accessToken}`,
  //method: 'post',
  //body,
  //json: true
  //});
  const data = {
    tag_group: [
      {
        group_id: 'etE4KRCgAANe2_fRutV_8-ARI1z8ItPg',
        group_name: '55',
        create_time: 1614863999,
        tag: [
          {
            id: 'etE4KRCgAA0gWYmBL4ESm9-eu05G3d',
            name: '555555',
            create_time: 1614863999,
            order: 0
          }
        ],
        order: 0,
        __v: 0
      }
    ]
  };
  //console.log(data, '+++++++++++++++++++++++');

  const item = data.tag_group[0];
  console.log(item.tag[0].id, '[[[[[');

  try {
    let res = await customerCorpTags.aggregate([
      {
        $match: { group_id: item.group_id }
      },
      {
        $facet: {
          ddddd: [
            {
              $match: {
                'tag.id': {
                  $ne: item.tag[0].id
                }
              }
            },
            {
              $set: {
                tag: { $concatArrays: ['$tag', [item.tag[0]]] }
              }
            }
          ]
        }
      }
    ]);
    console.log(JSON.stringify(res[0]['ddddd'][0], null, 4));
    res = await customerCorpTags.updateOne(
      { group_id: item.group_id },
      { $set: { tag: res[0]['ddddd'][0].tag } }
    );
    ctx.success(res);
  } catch (err) {
    console.log(err, 'errrrrrrrrr');
    ctx.success(err);
  }
});

// 获取成员二维码 (让客户添加)
router.post('/memberQrCode', async (ctx, next) => {
  const body = ctx.request.body;

  const data = await request({
    url: `${ctx.$config.wechatBaseUrl}externalcontact/add_contact_way?access_token=${ctx.accessToken}`,
    method: 'post',
    body,
    json: true
  });

  data._id = data.config_id;
  Object.assign(data, body);
  delete data.errcode;
  delete data.errmsg;

  try {
    const res = await memberQrCode.create(data);
    ctx.success(res);
  } catch (err) {
    ctx.success(err);
  }
});
export default router.routes();
