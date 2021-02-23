// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import React, { useRef, useEffect, useCallback, CSSProperties } from 'react';
import { List, ListRowRenderer } from 'react-virtualized';

import { missingCaseError } from '../util/missingCaseError';
import { assert } from '../util/assert';
import { LocalizerType } from '../types/Util';

import {
  ConversationListItem,
  PropsData as ConversationListItemPropsType,
} from './conversationList/ConversationListItem';
import {
  ContactListItem,
  PropsDataType as ContactListItemPropsType,
} from './conversationList/ContactListItem';
import { Spinner as SpinnerComponent } from './Spinner';
import { StartNewConversation as StartNewConversationComponent } from './conversationList/StartNewConversation';

export enum RowType {
  ArchiveButton,
  Contact,
  Conversation,
  Header,
  MessageSearchResult,
  Spinner,
  StartNewConversation,
}

type ArchiveButtonRowType = {
  type: RowType.ArchiveButton;
  archivedConversationsCount: number;
};

type ContactRowType = {
  type: RowType.Contact;
  contact: ContactListItemPropsType;
};

type ConversationRowType = {
  type: RowType.Conversation;
  conversation: ConversationListItemPropsType;
};

type MessageRowType = {
  type: RowType.MessageSearchResult;
  messageId: string;
};

type HeaderRowType = {
  type: RowType.Header;
  i18nKey: string;
};

type SpinnerRowType = { type: RowType.Spinner };

type StartNewConversationRowType = {
  type: RowType.StartNewConversation;
  phoneNumber: string;
};

export type Row =
  | ArchiveButtonRowType
  | ContactRowType
  | ConversationRowType
  | MessageRowType
  | HeaderRowType
  | SpinnerRowType
  | StartNewConversationRowType;

export type PropsType = {
  dimensions?: {
    width: number;
    height: number;
  };
  rowCount: number;
  // If `getRow` is called with an invalid index, it should return `undefined`. However,
  //   this should only happen if there is a bug somewhere. For example, an inaccurate
  //   `rowCount`.
  getRow: (index: number) => undefined | Row;
  scrollToRowIndex?: number;
  shouldRecomputeRowHeights: boolean;

  i18n: LocalizerType;

  onSelectConversation: (conversationId: string, messageId?: string) => void;
  onClickArchiveButton: () => void;
  renderMessageSearchResult: (id: string, style: CSSProperties) => JSX.Element;
  startNewConversationFromPhoneNumber: (e164: string) => void;
};

export const ConversationList: React.FC<PropsType> = ({
  dimensions,
  getRow,
  i18n,
  onClickArchiveButton,
  onSelectConversation,
  renderMessageSearchResult,
  rowCount,
  scrollToRowIndex,
  shouldRecomputeRowHeights,
  startNewConversationFromPhoneNumber,
}) => {
  const listRef = useRef<null | List>(null);

  useEffect(() => {
    const list = listRef.current;
    if (shouldRecomputeRowHeights && list) {
      list.recomputeRowHeights();
    }
  }, [shouldRecomputeRowHeights]);

  const calculateRowHeight = useCallback(
    ({ index }: { index: number }): number => {
      const row = getRow(index);
      if (!row) {
        assert(false, `Expected a row at index ${index}`);
        return 68;
      }
      return row.type === RowType.Header ? 40 : 68;
    },
    [getRow]
  );

  const renderRow: ListRowRenderer = useCallback(
    ({ key, index, style }) => {
      const row = getRow(index);
      if (!row) {
        assert(false, `Expected a row at index ${index}`);
        return <div key={key} style={style} />;
      }

      switch (row.type) {
        case RowType.ArchiveButton:
          return (
            <button
              key={key}
              className="module-conversation-list__item--archive-button"
              style={style}
              onClick={onClickArchiveButton}
              type="button"
            >
              {i18n('archivedConversations')}{' '}
              <span className="module-conversation-list__item--archive-button__archived-count">
                {row.archivedConversationsCount}
              </span>
            </button>
          );
        case RowType.Contact:
          return (
            <ContactListItem
              {...row.contact}
              key={key}
              style={style}
              onClick={onSelectConversation}
              i18n={i18n}
            />
          );
        case RowType.Conversation:
          return (
            <ConversationListItem
              {...row.conversation}
              key={key}
              style={style}
              onClick={onSelectConversation}
              i18n={i18n}
            />
          );
        case RowType.Header:
          return (
            <div
              className="module-conversation-list__item--header"
              key={key}
              style={style}
            >
              {i18n(row.i18nKey)}
            </div>
          );
        case RowType.Spinner:
          return (
            <div
              className="module-conversation-list__item--spinner"
              key={key}
              style={style}
            >
              <SpinnerComponent size="24px" svgSize="small" />
            </div>
          );
        case RowType.MessageSearchResult:
          return (
            <React.Fragment key={key}>
              {renderMessageSearchResult(row.messageId, style)}
            </React.Fragment>
          );
        case RowType.StartNewConversation:
          return (
            <StartNewConversationComponent
              i18n={i18n}
              key={key}
              phoneNumber={row.phoneNumber}
              onClick={() => {
                startNewConversationFromPhoneNumber(row.phoneNumber);
              }}
              style={style}
            />
          );
        default:
          throw missingCaseError(row);
      }
    },
    [
      getRow,
      i18n,
      onClickArchiveButton,
      onSelectConversation,
      renderMessageSearchResult,
      startNewConversationFromPhoneNumber,
    ]
  );

  // Though `width` and `height` are required properties, we want to be careful in case
  //   the caller sends bogus data. Notably, react-measure's types seem to be inaccurate.
  const { width = 0, height = 0 } = dimensions || {};
  if (!width || !height) {
    return null;
  }

  return (
    <List
      className="module-conversation-list"
      height={height}
      ref={listRef}
      rowCount={rowCount}
      rowHeight={calculateRowHeight}
      rowRenderer={renderRow}
      scrollToIndex={scrollToRowIndex}
      tabIndex={-1}
      width={width}
    />
  );
};
