"use strict";

/*=========================================================
 VALIDATE AI ANSWER
=========================================================*/

function validateAnswer(

    answer

) {

    if (

        !answer ||

        typeof answer !== "object"

    ) {

        return false;

    }

    if (

        typeof answer.answer !== "string"

    ) {

        return false;

    }

    if (

        typeof answer.domain !== "string"

    ) {

        return false;

    }

    if (

        typeof answer.provider !== "string"

    ) {

        return false;

    }

    if (

        typeof answer.confidence !== "number"

    ) {

        return false;

    }

    return true;

}

/*=========================================================
 EXPORTS
=========================================================*/

module.exports = {

    validateAnswer

};