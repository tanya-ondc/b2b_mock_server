import {SERVICES_DOMAINS } from "./apiConstants";
import { redis } from "./redis"

async function redisFetchToServer(action: string, transaction_id: string) {
  const transactionKeys = await redis.keys(`${transaction_id}-*`);
  
  const ifTransactionExist = transactionKeys.filter((e) =>
    e.includes(`${action}-to-server`)
  );
  if (ifTransactionExist.length === 0) {
    return null
  }

  const transaction = await redis.mget(ifTransactionExist);
  const parsedTransaction = transaction.map((ele: any) => {
    return JSON.parse(ele as string);
  });

  return parsedTransaction[0].request
}

async function redisFetchFromServer(action: string, transaction_id: string) {
  const transactionKeys = await redis.keys(`${transaction_id}-*`);

  const ifTransactionExist = transactionKeys.filter((e) =>
    e.includes(`-${action}-from-server`)
);

  if (ifTransactionExist.length === 0) {
    return null
  }

  const transaction = await redis.mget(ifTransactionExist);
  const parsedTransaction = transaction.map((ele: any) => {
    return JSON.parse(ele as string);
  });

  return parsedTransaction[0].request
}

async function redisExistToServer(action: string, transaction_id: string) {
  const transactionKeys = await redis.keys(`${transaction_id}-*`);
  const ifTransactionExist = transactionKeys.filter((e) =>
    e.includes(`${action}-to-server`)
  );

  if (ifTransactionExist.length === 0) {
    return false
  }
  else
    return true
}

async function redisExistFromServer(action: string, transaction_id: string) {
  const transactionKeys = await redis.keys(`${transaction_id}-*`);
  const ifTransactionExist = transactionKeys.filter((e) =>
    e.includes(`${action}-from-server`)
  );

  if (ifTransactionExist.length === 0) {
    return false
  }
  else
    return true
}


async function findIncompleteOnConfirmCalls() {
  try {

    const keys = await redis.keys('*-on_confirm-from-server');
    if (keys.length === 0) {
      console.log('No matching keys found');
      return [];
    }

    const values = await redis.mget(keys);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const incompleteCalls = values
      .map((value: any, index: any) => {
        const parsedValue = JSON.parse(value);
        return {
          key: keys[index],
          ...parsedValue,
        };
      })
      .filter(item => ((item.request.context.domain === SERVICES_DOMAINS.AGRI_SERVICES || item.request.context.domain === SERVICES_DOMAINS.HEALTHCARE_SERVICES) && new Date(item.response.timestamp) > new Date(fiveMinutesAgo)));

    return incompleteCalls;
  } catch (error) {
    console.error('Error finding incomplete on_confirm calls:', error);
  }
}


export { redisFetchToServer, redisFetchFromServer, redisExistFromServer, redisExistToServer, findIncompleteOnConfirmCalls }