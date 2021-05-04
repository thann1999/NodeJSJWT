const Dataset = require('../models/dataset.model');
const File = require('../models/file.model');
const DatasetDao = require('../dao/dataset.dao');
const AccountDao = require('../dao/account.dao');
const CommentDao = require('../dao/comment.dao');
const FileDao = require('../dao/file.dao');
const fs = require('fs');
const { validationResult } = require('express-validator');
const TagsDao = require('../dao/tags.dao');
const { getRandomImage, IMAGE_TYPE } = require('../utils/image-dataset');
const { uploadImageGoogleDrive } = require('../utils/upload-google-drive');
const AdmZip = require('adm-zip');
const path = require('path');
const { columnsAnalysis } = require('./common/analysis-column');
const classes = require('../utils/common-classes');
const _ = require('lodash');
const { diff } = require('json-diff');
const {
  readFileByPath,
  deleteFiles,
  deleteFolder,
} = require('./common/crud-file-local');
const { FileVersion, FILE_STATUS } = require('../utils/file-version');
const { COLUMN_TYPE, FILE_TYPES } = require('../utils/file-column-type');
const createDataset = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  const { title, url, description, visibility, username, accountId } = req.body;
  const path = `${process.env.PATH_UPLOAD_FILE}/${username}/dataset/${url}`;

  //add file and get result, summary
  const { datasetSummary, fileChanges, filesResult, size } = await addFile(
    req.files
  );

  //Create dataset with array fileId
  const defaultImage = getRandomImage();
  const dataset = new Dataset({
    thumbnail: `https://drive.google.com/uc?export=view&id=${defaultImage.thumbnail}`,
    banner: `https://drive.google.com/uc?export=view&id=${defaultImage.banner}`,
    title: title.trim(),
    owner: req.user.id,
    subtitle: '',
    description: description ? description.trim() : '',
    tags: [],
    summary: datasetSummary,
    countLike: 0,
    like: [],
    versions: [{ version: 'Phiên bản đầu tiên', fileChanges: fileChanges }],
    size: size,
    path: path,
    url: url,
    visibility: visibility,
    files: filesResult.map((file) => file._id),
  });

  //Insert dataset into Dataset collection
  const result = await DatasetDao.insertDataset(dataset);

  //Update datasetId into Account collection
  await AccountDao.updateDatasetsOfAccount(accountId, result._id, true);

  res.status(200).json({ message: 'Upload Dataset thành công' });
};

const getOneDataset = async (req, res, next) => {
  const { username, url } = req.params;
  const result = await DatasetDao.findDatasetAndAccountInfo(url);
  if (!result || result.owner.username !== username) {
    return res.status(400).json({ message: 'URL không đúng' });
  }

  res.status(200).json({ data: createDatasetObject(result) });
};

/* Update description */
const updateDatasetDescription = async (req, res, next) => {
  try {
    const { datasetId, description } = req.body;
    await DatasetDao.updateDescription(datasetId, description);
    res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (error) {
    next(error);
  }
};

/* Update description */
const updateDatasetVisibility = async (req, res, next) => {
  try {
    const { datasetId, visibility } = req.body;
    await DatasetDao.updateVisibility(datasetId, visibility);
    res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (error) {
    next(error);
  }
};

/* Update title and subtitle */
const updateDatasetTitleAndSubtitle = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json(errors.array());
  }
  try {
    const { datasetId, title, subTitle } = req.body;
    await DatasetDao.updateTitleAndSubtitle(
      datasetId,
      title.trim(),
      subTitle.trim()
    );
    res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (error) {
    next(error);
  }
};

/* Update dataset banner/thumbnail */
const updateDatasetImage = async (req, res, next) => {
  try {
    const { datasetId, imageType } = req.body;
    const idImage = await uploadImageGoogleDrive(req.file);
    const googleDriveLink = `https://drive.google.com/uc?export=view&id=${idImage}`;
    parseInt(imageType) === IMAGE_TYPE.BANNER
      ? await DatasetDao.updateBanner(datasetId, googleDriveLink)
      : await DatasetDao.updateThumbnail(datasetId, googleDriveLink);
    res
      .status(200)
      .json({ message: 'Cập nhật thành công', data: googleDriveLink });
  } catch (error) {
    next(error);
  }
};

/* Update dataset tags */
const updateDatasetTags = async (req, res, next) => {
  try {
    const { datasetId, oldTags, newTags } = req.body;
    const differentTags = getDifferent(newTags, oldTags);
    const removeTags = getDifferent(oldTags, newTags);

    if (
      differentTags.length > 0 ||
      (differentTags.length === 0 && newTags.length < oldTags.length)
    ) {
      await DatasetDao.updateTags(datasetId, newTags);
      if (differentTags.length > 0) {
        const tagsSaved = await TagsDao.findTagInArrayName(differentTags);
        let tagsSaveYet = getDifferent(differentTags, tagsSaved);
        tagsSaveYet = tagsSaveYet.map(
          (tags) => new classes.Tags(tags.name, datasetId, req.user.id)
        );

        if (tagsSaved.length > 0) {
          await TagsDao.pushDatasetIdTags(datasetId, tagsSaved);
        }
        await TagsDao.insertMultipleTags(tagsSaveYet);
      } else {
        await TagsDao.removeDatasetIdTags(datasetId, removeTags);
      }
    }

    res.status(200).json({ message: 'Cập nhật thành công' });
  } catch (error) {
    next(error);
  }
};

/* Find all tags */
const findAllTags = async (req, res, next) => {
  try {
    const result = await TagsDao.findAllTags();
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

/* Find dataset most like */
const findTrendingDataset = async (req, res, next) => {
  try {
    const like = 'desc';
    const datasetResult = await DatasetDao.findDatasetSortByLike(
      null,
      null,
      null,
      null,
      null,
      like,
      null,
      4,
      0
    );
    const tagsResult = await TagsDao.find5LargestTags();
    const tagsDatasets = tagsResult.map((tags) => createTagsObject(tags));
    const datasets = datasetResult.map((dataset) =>
      createDatasetObject(dataset)
    );
    res
      .status(200)
      .json({ data: { datasets: datasets, tagsDatasets: tagsDatasets } });
  } catch (error) {
    next(error);
  }
};

/* Filter dataset */
const searchDataset = async (req, res, next) => {
  try {
    const { title, like, tags, fileTypes, minSize, maxSize, date } = req.body;
    const page = parseInt(req.body.page);
    const limit = parseInt(req.body.limit);
    const startIndex = (page - 1) * limit;
    let result = { countDatasets: 0, datasets: {} };
    if (!tags || tags.length !== 1) {
      const datasetsResult = await DatasetDao.findDatasetSortByLike(
        title,
        tags,
        fileTypes,
        minSize,
        maxSize,
        like,
        date,
        limit,
        startIndex
      );
      const countDatasets = await DatasetDao.countDatasets(
        title,
        tags,
        fileTypes,
        minSize,
        maxSize,
        date
      );
      let datasets = [];
      if (countDatasets > 0)
        datasets = datasetsResult.map((dataset) =>
          createDatasetObject(dataset)
        );

      result = {
        countDatasets: countDatasets,
        datasets: datasets,
      };
    } else {
      const tagsResult = await TagsDao.findDatasetInTags(
        tags,
        title,
        fileTypes,
        minSize,
        maxSize,
        like,
        date,
        limit,
        startIndex
      );
      const countDatasets = await TagsDao.countDatasetInTags(
        tags,
        title,
        fileTypes,
        minSize,
        maxSize,
        date
      );

      let tagsDataset = [];
      if (tagsResult.datasets.length !== 0) {
        tagsDataset = createTagsObject(tagsResult);
      }
      result = {
        countDatasets: countDatasets.datasets.length,
        datasets:
          tagsResult.datasets.length === 0 ? tagsDataset : tagsDataset.datasets,
      };
    }
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
};

//Like or dislike dataset
const likeOrUnLikeDataset = async (req, res, next) => {
  const { datasetId } = req.body;
  const accountId = req.user.id;
  const checkLike = await DatasetDao.checkLikeOrNot(datasetId, accountId);
  await DatasetDao.likeOrUnLike(datasetId, accountId, checkLike ? false : true);
  res.status(200).send({ message: 'Cập nhật thành công' });
};

//Download dataset
async function downloadDataset(req, res, next) {
  const { pathDataset } = req.body;
  const zip = new AdmZip();
  const files = fs.readdirSync(pathDataset);
  files.forEach((file) => {
    zip.addLocalFile(path.join(pathDataset, file));
  });
  const file_after_download = 'dataset.zip';
  const data = zip.toBuffer();
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', `attachment; filename=${file_after_download}`);
  res.set('Content-Length', data.length);
  res.send(data);
}

/* Delete Dataset */
async function deleteDataset(req, res, next) {
  const { datasetId } = req.body;
  const datasetInfo = await DatasetDao.findDatasetById(datasetId);
  const { path, files, tags } = datasetInfo;

  //delete file in local
  deleteFolder(path);

  //delete file in db
  await Promise.all([
    DatasetDao.deleteDatasetById(datasetId),
    FileDao.deleteManyFilesById(files),
    CommentDao.deleteAllCommentInDataset(datasetId),
    AccountDao.updateDatasetsOfAccount(req.user.id, datasetId, false),
    TagsDao.removeDatasetIdTags(datasetId, tags),
  ]);
  res.status(200).json({ message: 'Xóa dataset thành công' });
}

/* Create new version */
async function createNewVersion(req, res, next) {
  try {
    const fileModifies = req.fileModifies;
    const { datasetId, version, username, url } = req.body;
    const previousFiles = JSON.parse(req.body.previousFiles);
    const datasetPath = `${process.env.PATH_UPLOAD_FILE}/${username}/dataset/${url}/files/`;
    //remove duplicate file
    const currentDataset = await DatasetDao.findAllFilesOfDataset(datasetId);

    const deleteFiles = currentDataset.files.filter(
      ({ _id: id1 }) =>
        !previousFiles.some((file) => id1.toString() === file._id)
    );

    const modifies = previousFiles.filter(({ name: name1 }) =>
      req.files.some(({ originalname: name2 }) => name1 === name2)
    );

    const deleteAndModifies = _.union(modifies, deleteFiles);

    //add file and get result, summary
    const result = await Promise.all([
      addFile(req.files, fileModifies, datasetPath),
      DatasetDao.updateFileIdInDataset(
        datasetId,
        deleteFiles.map((file) => file._id),
        true
      ),
      FileDao.deleteManyFilesById(deleteAndModifies.map((file) => file._id)),
    ]);

    const { datasetSummary, fileChanges, filesResult, size } = result[0];

    let subSize = 0;
    deleteAndModifies.forEach((file) => {
      subSize += file.size;
    });

    deleteFiles.forEach((file) => {
      const countRows = countAllRows(file.columns[0]);
      fileChanges.push(
        new FileVersion(file.name, FILE_STATUS.DELETE, {
          add: 0,
          remove: countRows,
        })
      );
    });

    await Promise.all([
      DatasetDao.createNewVersionDataset(
        datasetId,
        { version: version, fileChanges: fileChanges },
        currentDataset.size - subSize + size
      ),
      DatasetDao.updateFileIdInDataset(
        datasetId,
        filesResult.map((file) => file._id),
        false
      ),
    ]);

    //delete local file
    deleteFiles(deleteFiles.map((file) => file.path));

    res.status(200).json({ message: 'Tạo phiên bản mới thành công' });
  } catch (error) {
    next(error);
  }
}

/* Common handle function */

//Analysis column
async function analysis(path) {
  //read file content to json
  const jsonContent = await readFileByPath(path);
  const idArray = ['id', 'ID', '_id', '_ID', 'Rank'];
  const arrayColumns = Object.keys(jsonContent[0]).map((key) => {
    let type;
    if (idArray.includes(key)) type = COLUMN_TYPE.ID;
    else {
      type = !isNaN(parseFloat(jsonContent[0][key]))
        ? COLUMN_TYPE.NUMBER
        : COLUMN_TYPE.STRING;
    }
    return new classes.FileColumn(key, type, {}, '');
  });
  columnsAnalysis(arrayColumns, jsonContent);
  return arrayColumns;
}

//Create dataset object from result database
function createDatasetObject(dataset) {
  const { _id, avatar, name, username, email } = dataset.owner;
  return {
    accountId: _id,
    avatar: avatar,
    name: name,
    email: email,
    username: username,
    dataset: dataset,
  };
}

// Get different array between 2 arrays
const getDifferent = (array1 = [], array2 = []) => {
  return array1.filter(
    ({ name: name1 }) => !array2.some(({ name: name2 }) => name2 === name1)
  );
};

//Create tags object from result database
const createTagsObject = (tags) => {
  const datasets = tags.datasets.map((dataset) => createDatasetObject(dataset));
  const { _id, name, datasetsLength, createdDate } = tags;
  return {
    _id: _id,
    name: name,
    datasetsLength: datasetsLength,
    createdDate: createdDate,
    datasets: datasets,
  };
};

//Get file type
function getFileType(mimeType) {
  let fileType = '';
  switch (mimeType) {
    case 'application/vnd.ms-excel':
      fileType = FILE_TYPES.CSV;
      break;
    case 'application/json':
      fileType = FILE_TYPES.JSON;
      break;
  }
  return fileType;
}

async function addFile(files, fileModifies, path) {
  //remove duplicate file
  files = files.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t.originalname === item.originalname)
  );

  const fileChanges = [];

  const fileContents = await Promise.all(
    files.map(async (file) => {
      const fileType = getFileType(file.mimetype);
      const columns = await analysis(file.path, fileType);
      const countRows = countAllRows(columns[0]);

      let changeDetails = {
        add: countRows,
        remove: 0,
      };
      let status = FILE_STATUS.ADD;

      if (fileModifies && fileModifies.has(file.originalname)) {
        changeDetails = await compare2Files(
          file.path,
          `${path}${fileModifies.get(file.originalname)}`
        );
        status = FILE_STATUS.MODIFIED;
      }

      fileChanges.push(
        new FileVersion(file.originalname, status, changeDetails)
      );

      return new File({
        name: file.originalname,
        size: file.size,
        fileType: fileType,
        path: file.path,
        summary: {},
        columns: columns,
        description: '',
      });
    })
  );

  //count size, analysis summary dataset
  let size = 0,
    fileTypes = new Set();
  fileContents.forEach((item) => {
    size += item.size;
    fileTypes.add(item.fileType);
  });

  //Dataset contains file type csv, json or others
  const datasetSummary = new classes.DatasetSummary(Array.from(fileTypes));

  //Insert multiple file into File collection
  const filesResult = await FileDao.insertMultipleFile(fileContents);

  return {
    datasetSummary: datasetSummary,
    filesResult: filesResult,
    fileChanges: fileChanges,
    size: size,
  };
}

function countAllRows(column) {
  return (
    column.analysis.missing + column.analysis.valid + column.analysis.wrongType
  );
}

async function compare2Files(path1, path2) {
  try {
    const file = await Promise.all([
      readFileByPath(path2),
      readFileByPath(path1),
    ]);
    const different = {
      add: 0,
      remove: 0,
    };
    file[0].forEach((item, index) => {
      const diffResult = diff(item, file[1][index]);
      if (diffResult !== undefined) {
        different.add++;
        different.remove++;
      }
    });

    //delete old file
    deleteFiles([path2]);
    return different;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createDataset: createDataset,
  getOneDataset: getOneDataset,
  updateDatasetDescription: updateDatasetDescription,
  updateDatasetVisibility: updateDatasetVisibility,
  updateDatasetTitleAndSubtitle: updateDatasetTitleAndSubtitle,
  updateDatasetImage: updateDatasetImage,
  updateDatasetTags: updateDatasetTags,
  findAllTags: findAllTags,
  findTrendingDataset: findTrendingDataset,
  searchDataset: searchDataset,
  likeOrUnLikeDataset: likeOrUnLikeDataset,
  downloadDataset: downloadDataset,
  createNewVersion: createNewVersion,
  deleteDataset: deleteDataset,
};