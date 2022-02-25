import {event} from './eventType.js';

const handleEvent = async (msgBody) => {
  const body = await event[msgBody.Event][msgBody.ChangeType](msgBody);
  return '';
}
export default handleEvent;
