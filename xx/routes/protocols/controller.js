'use strict'
const Protocol = require('./models').Protocol;
module.exports = {
    create(req, res) {
        return Protocol
            .create({
                id: req.body.id,
                uri: req.body.uri,
                addressBook: req.body.addressBook,
            })
            .then((sample) => res.status(201).send(sample))
            .catch((error) => res.status(400).send(error));
    },

    list(req, res) {
        return Protocol
            .findAll({
                order: [
                    ['uri', 'DESC'],
                    // [{ model: TodoItem, as: 'todoItems' }, 'createdAt', 'ASC'],
                ],
            })
            .then((sample) => res.status(200).send(sample))
            .catch((error) => res.status(400).send(error));
    },

    retrieve(req, res) {
        return Protocol
            .findById(req.params.id, {

            })
            .then((sample) => {
                if (!sample) {
                    return res.status(404).send({
                        message: 'Todo Not Found',
                    });
                }
                return res.status(200).send(sample);
            })
            .catch((error) => res.status(400).send(error));
    },

    update(req, res) {
        return Protocol
            .findById(req.params.id, {
            })
            .then(sample => {
                if (!sample) {
                    return res.status(404).send({
                        message: 'Gedan Not Found',
                    });
                }
                return sample
                    .update({
                        name: req.body.name || sample.name,
                        uri: req.body.uri || sample.uri,
                        addressBook: req.body.addressBook || sample.addressBook,
                    })
                    .then(() => res.status(200).send(sample))
                    .catch((error) => res.status(400).send(error));
            })
            .catch((error) => res.status(400).send(error));
    },

    destroy(req, res) {
        return Protocol
            .findById(req.params.id)
            .then(sample => {
                if (!sample) {
                    return res.status(400).send({
                        message: 'gedan Not Found',
                    });
                }
                return sample
                    .destroy()
                    .then(() => res.status(204).send())
                    .catch((error) => res.status(400).send(error));
            })
            .catch((error) => res.status(400).send(error));
    },
};