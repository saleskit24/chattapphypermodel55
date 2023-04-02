import {
  ExportFormatV1,
  ExportFormatV2,
  ExportFormatV3,
  ExportFormatV4,
  LatestExportFormat,
  SupportedExportFormats,
} from '@/types/export';
import {
  convertChatGPTDataToNativeFormat,
  isChatGPTDataFormat,
} from './chatgpt/chatgpt-data';
import { cleanConversationHistory } from './clean';

export function isExportFormatV1(obj: any): obj is ExportFormatV1 {
  return Array.isArray(obj);
}

export function isExportFormatV2(obj: any): obj is ExportFormatV2 {
  return !('version' in obj) && 'folders' in obj && 'history' in obj;
}

export function isExportFormatV3(obj: any): obj is ExportFormatV3 {
  return obj.version === 3;
}

export function isExportFormatV4(obj: any): obj is ExportFormatV4 {
  return obj.version === 4;
}

export const isLatestExportFormat = isExportFormatV4;

export function cleanData(data: SupportedExportFormats): LatestExportFormat {
  if (isChatGPTDataFormat(data)) {
    return convertChatGPTDataToNativeFormat(data);
  }

  if (isExportFormatV1(data)) {
    return {
      version: 4,
      history: cleanConversationHistory(data),
      folders: [],
      prompts: [],
    };
  }

  if (isExportFormatV2(data)) {
    return {
      version: 4,
      history: cleanConversationHistory(data.history || []),
      folders: (data.folders || []).map((chatFolder) => ({
        id: chatFolder.id.toString(),
        name: chatFolder.name,
        type: 'chat',
      })),
      prompts: [],
    };
  }

  if (isExportFormatV3(data)) {
    return { ...data, version: 4, prompts: [] };
  }

  if (isExportFormatV4(data)) {
    return data;
  }

  throw new Error('Unsupported data format');
}

function currentDate() {
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}-${day}`;
}

export const getCurrentData = () => {
  let history = localStorage.getItem('conversationHistory');
  let folders = localStorage.getItem('folders');
  let prompts = localStorage.getItem('prompts');

  if (history) {
    history = JSON.parse(history);
  }

  if (folders) {
    folders = JSON.parse(folders);
  }

  if (prompts) {
    prompts = JSON.parse(prompts);
  }

  const data = {
    version: 4,
    history: history || [],
    folders: folders || [],
    prompts: prompts || [],
  } as LatestExportFormat;

  return data;
};

export const exportData = () => {
  const data = getCurrentData();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `chatbot_ui_history_${currentDate()}.json`;
  link.href = url;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Merges two export formats together and returns the result. Items are deduplicated by ID.
 * @param data1
 * @param data2
 * @returns
 */
export const mergeData = (data1: ExportFormatV4, data2: ExportFormatV4) => {
  const mergeListsById = <T extends { id: string }>(
    list1: T[],
    list2: T[],
  ): T[] => {
    const mergedList = [...list1];
    const existingIds = new Set(list1.map((item) => item.id));

    list2.forEach((item) => {
      if (!existingIds.has(item.id)) {
        mergedList.push(item);
      }
    });

    return mergedList;
  };

  const merged = {
    ...data1,
    history: mergeListsById(data1.history, data2.history),
    folders: mergeListsById(data1.folders, data2.folders),
    prompts: mergeListsById(data1.prompts, data2.prompts),
  };
  return merged;
};

export const importData = (
  data: SupportedExportFormats,
): LatestExportFormat => {
  const currentData = getCurrentData();

  const cleanedData = cleanData(data);

  const mergedData = mergeData(currentData, cleanedData);
  const { history, folders, prompts } = mergedData;

  const conversations = history;
  localStorage.setItem('conversationHistory', JSON.stringify(conversations));
  localStorage.setItem(
    'selectedConversation',
    JSON.stringify(conversations[conversations.length - 1]),
  );

  localStorage.setItem('folders', JSON.stringify(folders));
  localStorage.setItem('prompts', JSON.stringify(prompts));

  return cleanedData;
};
