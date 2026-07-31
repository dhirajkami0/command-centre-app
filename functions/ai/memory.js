"use strict";

/*
==========================================================
 GreenGuard AI Memory
==========================================================
*/

const Memory = {};

const STORE = new Map();

const MAX_AGE = 30 * 60 * 1000; // 30 minutes

/*----------------------------------------------------------
Cleanup
----------------------------------------------------------*/

Memory.cleanup = function () {

    const now = Date.now();

    for (const [id, item] of STORE.entries()) {

        if (now - item.updated > MAX_AGE) {

            STORE.delete(id);

        }

    }

};

/*----------------------------------------------------------
Get Conversation
----------------------------------------------------------*/

Memory.get = function (conversationId) {

    Memory.cleanup();

    return STORE.get(conversationId) || null;

};

/*----------------------------------------------------------
Save Conversation
----------------------------------------------------------*/

Memory.save = function (conversationId, data = {}) {

    if (!conversationId) return;

    STORE.set(conversationId, {

        ...data,

        updated: Date.now()

    });

};
/*----------------------------------------------------------
Backward Compatibility
----------------------------------------------------------*/

Memory.saveConversation = function (
    conversationId,
    data = {}
) {
    return Memory.save(
        conversationId,
        data
    );
};
/*----------------------------------------------------------
Update Conversation
----------------------------------------------------------*/

Memory.update = function (conversationId, updates = {}) {

    if (!conversationId) return;

    const current =

        Memory.get(conversationId) || {};

    Memory.save(

        conversationId,

        {

            ...current,

            ...updates

        }

    );

};

/*----------------------------------------------------------
Delete Conversation
----------------------------------------------------------*/

Memory.clear = function (conversationId) {

    STORE.delete(conversationId);

};

module.exports = Memory;