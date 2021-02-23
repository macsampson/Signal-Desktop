// Copyright 2021 Signal Messenger, LLC
// SPDX-License-Identifier: AGPL-3.0-only

import { assert } from 'chai';

import { isConversationUnregistered } from '../../util/isConversationUnregistered';

describe('isConversationUnregistered', () => {
  it('returns false if passed an undefined discoveredUnregisteredAt', () => {
    assert.isFalse(isConversationUnregistered({}));
    assert.isFalse(
      isConversationUnregistered({ discoveredUnregisteredAt: undefined })
    );
  });

  it('returns false if passed a time fewer than 6 hours ago', () => {
    assert.isFalse(
      isConversationUnregistered({ discoveredUnregisteredAt: Date.now() })
    );

    const fiveHours = 1000 * 60 * 60 * 5;
    assert.isFalse(
      isConversationUnregistered({
        discoveredUnregisteredAt: Date.now() - fiveHours,
      })
    );
  });

  it('returns false if passed a time in the future', () => {
    assert.isFalse(
      isConversationUnregistered({ discoveredUnregisteredAt: Date.now() + 123 })
    );
  });

  it('returns true if passed a time more than 6 hours ago', () => {
    const oneMinute = 1000 * 60;
    const sixHours = 1000 * 60 * 60 * 6;

    assert.isTrue(
      isConversationUnregistered({
        discoveredUnregisteredAt: Date.now() - sixHours - oneMinute,
      })
    );
    assert.isTrue(
      isConversationUnregistered({
        discoveredUnregisteredAt: new Date(1999, 3, 20).getTime(),
      })
    );
  });
});
