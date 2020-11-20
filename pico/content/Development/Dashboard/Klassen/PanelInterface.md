# App\DashboardBundle\Controller\PanelController\PanelInterface  

Class BasePanelController

## Implements:
App\DashboardBundle\Controller\BasePanelInterface



## Methods

| Name | Description |
|------|-------------|
|[getDatabasePanel](#panelinterfacegetdatabasepanel)||
|[getRenderedPanel](#panelinterfacegetrenderedpanel)|/render-panel|
|[index](#panelinterfaceindex)|/|
|[loadData](#panelinterfaceloaddata)|Load the data|
|[reloadData](#panelinterfacereloaddata)|/load|




### PanelInterface::getDatabasePanel  

**Description**

```php
 getDatabasePanel (void)
```

 

 

**Parameters**

`This function has no parameters.`

**Return Values**

`void`


<hr />


### PanelInterface::getRenderedPanel  

**Description**

```php
public getRenderedPanel (\Request $request)
```

/render-panel 

Render the panel. If the Panel Controller extends `BasePanelController` it can just call `parent::renderPanel($request)` 

**Parameters**

* `(\Request) $request`

**Return Values**

`\JsonResponse`




<hr />


### PanelInterface::index  

**Description**

```php
public index (void)
```

/ 

Redirect user to ./load 

**Parameters**

`This function has no parameters.`

**Return Values**

`\RedirectResponse`




<hr />


### PanelInterface::loadData  

**Description**

```php
public loadData (\Request $request)
```

Load the data 

Main Part of the Class, all your operations happen in this function 

**Parameters**

* `(\Request) $request`

**Return Values**

`array`




**Throws Exceptions**


`\Exception`


<hr />


### PanelInterface::reloadData  

**Description**

```php
public reloadData (\Request $request)
```

/load 

Loads the data. needs to call `PanelInterface::loadData($request)` 

**Parameters**

* `(\Request) $request`

**Return Values**

`\JsonResponse`




**Throws Exceptions**


`\Exception`


<hr />

