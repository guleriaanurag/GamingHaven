const multer=require('multer')
const path=require('path')
const {v4:uid}=require('uuid')
const dt=new Date()

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname,'/uploads'))
    },
    filename: function (req, file, cb) {
        const uniqueSuffix =dt.getTime()+'-'+uid()
        const ext = file.mimetype.split("/")[1]
        cb(null, file.fieldname+''+ uniqueSuffix+"."+ext)
    }
})
    
const upload = multer({ storage: storage })

module.exports={upload}