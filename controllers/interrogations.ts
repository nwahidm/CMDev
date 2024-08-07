import { type NextFunction, type Request, type Response } from "express"
import { Interrogation } from "../models/interrogations"
import moment from "moment"
const url = "http://paket2.kejaksaan.info:5025/"

export const fetchAllInterrogations = async (req: Request, res: Response, next: NextFunction) => {
    const { name, status, startDate, endDate } = req.body
    console.log("[FETCH ALL INTERROGATIONS]", name, status, startDate, endDate)

    try {
        const totalNotYetFollowedUp = await Interrogation.countDocuments({ status: 0 })
        const totalBeingFollowedUp = await Interrogation.countDocuments({ status: 1 })
        const totalFollowedUp = await Interrogation.countDocuments({ status: 2 })

        let where = {}
        if (name) where = { ...where, name: { $regex: name, $options: 'i' } }
        if (status) where = { ...where, status }
        if (startDate && endDate) {
            where = {
                ...where, createdAt: {
                    $gte: moment(startDate).startOf("day").format(),
                    $lte: moment(endDate).endOf("day").format(),
                }
            }
        }

        const interrogations = await Interrogation.find(where).populate('caseId', 'name').populate('warrantId', 'warrantNumber').sort([['createdAt', 'desc']])

        res.status(200).json({
            status: 200,
            data: { totalNotYetFollowedUp, totalBeingFollowedUp, totalFollowedUp, interrogations }
        })
    } catch (error) {
        next(error)
    }
}

export const createInterrogation = async (req: Request, res: Response, next: NextFunction) => {
    const { caseId, warrantId, name, date, record, location, interrogators, targetIdentification, result } = req.body
    console.log("[CREATE INTERROGATION]", caseId, warrantId, name, date, record, location, interrogators, targetIdentification, result)

    try {
        const newInterrogation = new Interrogation({
            caseId,
            warrantId,
            name,
            date,
            record,
            location,
            interrogators,
            targetIdentification,
            result,
            status: 0
        })

        await newInterrogation.save()

        res.status(201).json({
            status: 201,
            message: "Interrogation Berhasil Dibuat"
        })
    } catch (error) {
        next(error)
    }
}

export const fetchInterrogationDetail = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id
    console.log("[FETCH INTERROGATION DETAIL]", id)

    try {
        //Check whether the interrogation exist or not
        const interrogation = await Interrogation.findById(id).populate({ path: 'caseId', populate: { path: 'satkerId' } }).populate('warrantId')

        if (!interrogation) {
            throw {
                name: "Not Found",
                message: "Interrogation tidak ditemukan"
            }
        }

        (<any>interrogation).warrantId.document = url + (<any>interrogation).warrantId.document

        res.status(200).json({
            status: 200,
            data: interrogation
        })
    } catch (error) {
        next(error)
    }
}

export const updateInterrogation = async (req: Request, res: Response, next: NextFunction) => {
    const _id = req.params.id
    const { name, date, record, location, interrogators, targetIdentification, result, status } = req.body
    console.log("[UPDATE INTERROGATION]", name, date, record, location, interrogators, targetIdentification, result, status)

    try {
        //Check whether the interrogation exist or not
        const interrogation = await Interrogation.findById(_id)

        if (!interrogation) {
            throw {
                name: "Not Found",
                message: "Interrogation tidak ditemukan"
            }
        }

        //Updated Data
        let updatedData = {}
        if (name) updatedData = { ...updatedData, name }
        if (date) updatedData = { ...updatedData, date: moment(date).format() }
        if (record) updatedData = { ...updatedData, record }
        if (location) updatedData = { ...updatedData, location }
        if (interrogators) updatedData = { ...updatedData, interrogators }
        if (targetIdentification) updatedData = { ...updatedData, targetIdentification }
        if (result) updatedData = { ...updatedData, result }
        if (status) updatedData = { ...updatedData, status }

        //Update Interrogation
        await Interrogation.updateOne({ _id }, { $set: updatedData })

        res.status(200).json({
            status: 200,
            message: `Interrogation dengan id ${_id} berhasil diperbaharui`
        })
    } catch (error) {
        next(error)
    }
}

export const deleteInterrogation = async (req: Request, res: Response, next: NextFunction) => {
    const _id = req.params.id
    console.log("[DELETE INTERROGATION]", _id);

    try {
        //Check whether the Interrogation exist or not
        const interrogation = await Interrogation.findById(_id)

        if (!interrogation) {
            throw {
                name: "Not Found",
                message: "Interrogation tidak ditemukan"
            }
        }

        await Interrogation.deleteOne({ _id })

        res.status(200).json({
            status: 200,
            message: `Interrogation dengan id ${_id} berhasil dihapus`
        })
    } catch (error) {
        next(error)
    }
}
